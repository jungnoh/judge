// Online Judge Runner Application
// Written for [C++]
// Edit the following values for each language:
// LANG_TIME_BONUS, LANG_MEM_BONUS, PROCESS_COUNT_LIM, runCmd

#include <sys/types.h>
#include <sys/resource.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include <sys/ptrace.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <fcntl.h>
#define MEGA 1048576
#define FILE_LIM MEGA<<9; //512MB
#define RAM_LIM MEGA<<10; //1GB
#define LANG TIME_BONUS 0 //set this for each language
#define LANG_MEM_BONUS 0  //set this for each language
#define PROCESS_COUNT_LIM 1 //set this for each language
#define BUF_SIZE 1024
#define INF 999999999

enum resultValues {
    QUE = 0,  // Queued
    CMP = 1,  // Compiling
    JUD = 2,  // Judging
    CE = 3,   // Compile Error
    RE = 4,   // Runtime Error
    ME = 5,   // Memory Exceeded
    WA = 6,   // Wrong Answer
    TLE = 7,  // Time Limit Exceeded
    OLE = 8,  // Output Limit Exceeded
    SE = 9,   // System Error (IO, ..)
    AC = 10   // Accepted
};
int getMem(int proc) {
    FILE *fp;
    int flg,val=0,i;
    char buf[BUF_SIZE],cmd[BUF_SIZE],msg[8]="VmPeak:";
    sprintf(cmd,"/proc/%d/status",proc);
    fp = fopen(cmd,"r");
    if(fp==NULL) return -1; //process exited
    while(fgets(buf,BUF_SIZE,fp)!=NULL) {
        //printf("%s",buf);
        if(strlen(msg)>strlen(buf)) continue;
        flg=1;
        for(i=0;msg[i];i++) {
            if(msg[i]!=buf[i]) {
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
        fclose(fp);
        return val;
    }
    return -1;
}
int main(int argc, const char * argv[]) {
    // ./run [mem_limit] [time_limit] [-m if memory is in mbs]
    const char *runCmd = "./run";
    system("cp /judgeData/run run; cp /judgeData/data.in data.in");
    int memLimit,timeLimit; //timeLimit in seconds, memLimit in kBs
    memLimit=atoi(argv[1]);
    timeLimit=atoi(argv[2]);
    //printf("%s %d %d",runCmd,memLimit,timeLimit);
    if(strcmp(argv[3],"-m")==0) memLimit=memLimit<<10;
    int pid = fork();
    if(pid==0) {
        int fdout = open("out.txt", O_RDWR | O_CREAT, 0664 | O_TRUNC);
        int fderr = open("error.txt", O_RDWR | O_CREAT, 0664 | O_TRUNC);
        int fdin  = open("data.in", O_RDONLY);
        dup2(fdin,STDIN_FILENO);
        dup2(fdout,STDOUT_FILENO);
        dup2(fderr,STDERR_FILENO);
        rlimit lim;
        //Stack size limit
        lim.rlim_cur=lim.rlim_max=memLimit<<10;
        setrlimit(RLIMIT_STACK,&lim);
        //Memory size limit (extra limit)
        lim.rlim_cur=lim.rlim_max=((memLimit<<10)*3)/2;
        setrlimit(RLIMIT_AS,&lim);
        //File size limit
        lim.rlim_cur=lim.rlim_max=FILE_LIM;
        setrlimit(RLIMIT_FSIZE,&lim);
        //Process count limit
        lim.rlim_cur=lim.rlim_max=PROCESS_COUNT_LIM;
        setrlimit(RLIMIT_NPROC,&lim);
        //Time limit
        lim.rlim_cur=timeLimit;
        lim.rlim_max=timeLimit+3;
        setrlimit(RLIMIT_CPU,&lim);
        //alarm(0);
        //alarm(timeLimit+1);
        execlp(runCmd,runCmd,NULL);
        exit(0);
    }
    else {
        //printf("%d",pid);
        rusage usage;
        int sig,status,maxMem=0,tempMem=0,result;
        long usedTime;
        //pid_t cpid = wait4(pid,&status,options,&usage);
        if(maxMem==0) maxMem=getMem(pid);
        while(1) {
            //printf("[[%d]]",maxMem);
            wait4(pid,&status,0,&usage);
            tempMem=getMem(pid);
            if(tempMem>maxMem)
                maxMem=tempMem;
            if(maxMem>memLimit) {
                fprintf(stderr,"Memory Limit Exceeded");
                kill(pid, SIGKILL);
                result=ME;
                break;
            }
            if(WIFSIGNALED(status)) {
                sig=WTERMSIG(status);
                switch(sig) {
                    case SIGSEGV:
                        fprintf(stderr,"SIGSEGV\n");
                        result=RE;
                        //fprintf(stderr,"%d",resultValues.RE);
                        break;
                    case SIGXCPU:
                        fprintf(stderr,"SIGXCPU\n"); //cpu limit, soft
                        result=TLE;
                        //fprintf(stderr,"%d",resultValues.RE);
                        break;
                    case SIGXFSZ:
                        fprintf(stderr,"SIGXFSZ\n");
                        result=OLE;
                        break;
                    case SIGKILL:
                        fprintf(stderr,"SIGKILL\n"); //cpu limit, hard
                        result=TLE;
                        break;
                    default:
                        fprintf(stderr,"something else\n");
                        break;
                }
                break;
            }
            if(WIFEXITED(status)) {
                fprintf(stderr,"Exited\n");
                result=AC;
                break;
            }
            if(WIFSTOPPED(status)) {
                printf("<%d>",sig);
            }
        }
        //finish up
        FILE *res=fopen("result.json","w");
        usedTime=usage.ru_stime.tv_sec*1000+usage.ru_stime.tv_usec/1000;
        usedTime+=usage.ru_utime.tv_sec*1000+usage.ru_utime.tv_usec/1000;
        if(result==TLE) usedTime=timeLimit*1000;
        fprintf(res,"{\"mem\":%d,\"time\":%ld,\"res\":%d}\n",maxMem,usedTime,result);
        //printf('%d %d %d %d',usage.ru_stime.tv_sec)
        fclose(res);
        system("mv error.txt /judgeData/error.txt; mv out.txt /judgeData/out.txt; mv result.json /judgeData/result.json");
    }
}
