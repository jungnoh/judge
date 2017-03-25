#include <fcntl.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ptrace.h>
#include <sys/resource.h>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <unistd.h>
#define MB 1<<20
#define FILE_LIM MB<<9   //File 512MB
#define RAM_LIM MB<<12   //2GB
#define PROC_COUNT_LIM 1
#define VmPeak "VmPeak:"
#define BUF_SIZE 1<<10
#define N_WIFEXITED(S) S==0?0:WIFEXITED(S) // http://stackoverflow.com/questions/1643210/why-would-wifexited-return-true-on-running-process
#define rQUE 0   // Queued
#define rCMP 1   // Compiling
#define rJUD 2   // Judging
#define rCE  3   // Compile Error
#define rRE  4   // Runtime Error
#define rME  5   // Memory Exceeded
#define rWA  6   // Wrong Answer
#define rTLE 7   // Time Limit Exceeded
#define rOLE 8   // Output Limit Exceeded
#define rSE  9   // System Error (IO, ..)
#define rAC  10  // Accepted
//#define DFLAG
int get_status_val(int proc,char *tag) {
     FILE *fp;
     int flg,val=0,i;
     char buf[BUF_SIZE],cmd[BUF_SIZE];
     sprintf(cmd,"/proc/%d/status",proc);
     fp=fopen(cmd,"r");
     if(fp==NULL) {
         //printf("Cannot find status file\n");
         return -1;
     }
     while(fgets(buf,BUF_SIZE,fp)!=NULL) {
        #ifdef DFLAG
        printf("%s",buf);
        #endif
        if(strlen(tag)>strlen(buf)) continue;
        flg=1;
        for(i=0;tag[i];i++) {
            if(tag[i]!=buf[i]) {
                flg=0;
                break;
            }
        }
        if(!flg) continue;
        for(;buf[i];i++) {
            if(buf[i]<'0'||buf[i]>'9') continue;
            val*=10;
            val+=buf[i]-'0';
        }
        break;
     }
     fclose(fp);
     return val?val:-1;
}
void write_json(int result_code, int mem_usage, int time_usage) {
    FILE *res=fopen("result.json","w");
    fprintf(res,"{\"mem\":%d,\"time\":%ld,\"res\":%d}\n",mem_usage,time_usage,result_code);
    fclose(res);
}
void run_code(int mem_limit,int time_limit) {
    nice(19);
    int fdout = open("out.txt", O_RDWR | O_CREAT, 0664 | O_TRUNC);
    int fderr = open("error.txt", O_RDWR | O_CREAT, 0664 | O_TRUNC);
    int fdin  = open("data.in", O_RDWR | O_CREAT, 0664 | O_TRUNC);
    dup2(fdin,STDIN_FILENO);
    dup2(fdout,STDOUT_FILENO);
    dup2(fderr,STDERR_FILENO);
    struct rlimit lim;
    //Stack size limit
    lim.rlim_cur=lim.rlim_max=mem_limit<<10;
    setrlimit(RLIMIT_STACK,&lim);
    //Memory size limit (extra limit)
    lim.rlim_cur=lim.rlim_max=((mem_limit<<10)*3)/2;
    setrlimit(RLIMIT_AS,&lim);
    //File size limit
    lim.rlim_cur=lim.rlim_max=FILE_LIM;
    setrlimit(RLIMIT_FSIZE,&lim);
    //Process count limit
    lim.rlim_cur=lim.rlim_max=PROC_COUNT_LIM;
    setrlimit(RLIMIT_NPROC,&lim);
    //Time limit
    lim.rlim_cur=time_limit;
    lim.rlim_max=time_limit+3;
    setrlimit(RLIMIT_CPU,&lim);

    execlp("./run","./run",NULL);
    //Should not reach here
    exit(0);

    //execlp("./run","./run",NULL);
    //execlp("curl","curl","curl namu.wiki",NULL);
    //execlp("g++","g++","asdf",NULL);
    //execlp("sleep","sleep","2",NULL);
    //execlp("apt-get","apt-get",NULL);
    //pause();
}
void watch_code(int pid,int mem_limit,int time_limit) {
    struct rusage usage;
    int sig,status,max_mem=0,temp_mem=0,result,used_time=0;
    while(1) {
        int wait_result=waitpid(pid,&status,WNOHANG);
        temp_mem=get_status_val(pid,VmPeak);
        if(temp_mem>0&&temp_mem>max_mem) max_mem=temp_mem;
        if(max_mem>mem_limit) {
            fprintf(stderr,"Memory Limit Exceeded");
            kill(pid, SIGKILL);
            getrusage(RUSAGE_CHILDREN,&usage);
            used_time=usage.ru_stime.tv_sec*1000+usage.ru_stime.tv_usec/1000;
            used_time+=usage.ru_utime.tv_sec*1000+usage.ru_utime.tv_usec/1000;
            max_mem=mem_limit;

            fprintf(stdout,"====================\n");
            fprintf(stdout,"PID:    %d\n",pid);
            fprintf(stdout,"STATUS: %d\n",WEXITSTATUS(status));
            fprintf(stdout,"MEM:    %d\n",max_mem);
            fprintf(stdout,"TIME:   %d\n",used_time);
            result=rME;
            break;
        }
        if(wait_result>0) {
            //Exited, evalutate RE, etc.
            getrusage(RUSAGE_CHILDREN,&usage);
            used_time=usage.ru_stime.tv_sec*1000+usage.ru_stime.tv_usec/1000;
            used_time+=usage.ru_utime.tv_sec*1000+usage.ru_utime.tv_usec/1000;

            fprintf(stdout,"====================\n");
            fprintf(stdout,"PID:    %d\n",pid);
            fprintf(stdout,"STATUS: %d\n",WEXITSTATUS(status));
            fprintf(stdout,"MEM:    %d\n",max_mem);
            fprintf(stdout,"TIME:   %d\n",used_time);

            //evaluate result
            result=rAC;
            if(WIFSIGNALED(status)) {
                sig=WTERMSIG(status);
                switch(sig) {
                    case SIGSEGV:
                        fprintf(stderr,"SIGSEGV\n");
                        result=rRE;
                        break;
                    case SIGXCPU:
                        fprintf(stderr,"SIGXCPU\n"); //cpu limit, soft
                        result=rTLE;
                        break;
                    case SIGXFSZ:
                        fprintf(stderr,"SIGXFSZ\n");
                        result=rOLE;
                        break;
                    case SIGKILL:
                        fprintf(stderr,"SIGKILL\n"); //cpu limit, hard
                        result=rTLE;
                        break;
                    default:
                        fprintf(stderr,"something else\n");
                        fprintf(stderr,"%d\n",sig);
                        break;
                }
            }
            break;
        }
    }
    fprintf(stdout,"RESULT: %d\n",result);
    fprintf(stdout,"====================\n");
    write_json(result,max_mem,used_time);
    return;
}
int main(int argc,const char *argv[]) {
    //.run [memory limit] [time limit]
    //get_status_val(pid,VmPeak);
    int mem_limit,time_limit;
    #ifdef DFLAG
    printf("DFLAG on\n");
    #endif // DFLAG
    if(argc<2) mem_limit=128,time_limit=2;
    else mem_limit=atoi(argv[1]), time_limit=atoi(argv[2]);
    mem_limit=mem_limit<<10;

    system("cp /judgeData/run run; cp /judgeData/data.in data.in");

    int pid=fork();
    if(pid==0) run_code(mem_limit,time_limit);
    else {
        watch_code(pid,mem_limit,time_limit);
        system("mv error.txt /judgeData/error.txt; mv out.txt /judgeData/out.txt; mv result.json /judgeData/result.json");
    }
}
