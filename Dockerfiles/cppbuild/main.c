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

void write_json(int result_code) {
    FILE *res=fopen("compile_result.json","w");
    fprintf(res,"{\"res\":%d}\n",result_code);
    fclose(res);
}
void run_code(int mem_limit,int time_limit) {
    nice(19);
    int fdout = open("compile_out.txt", O_RDWR | O_CREAT, 0664 | O_TRUNC);
    int fderr = open("compile_error.txt", O_RDWR | O_CREAT, 0664 | O_TRUNC);
    dup2(fdout,STDOUT_FILENO);
    dup2(fderr,STDERR_FILENO);
    //execlp("sleep","sleep","2",NULL);
    execlp("g++","g++","source.cpp","-o","run","-O2","-lm","--static",NULL);
    //Should not reach here
    exit(0);
}
void watch_code(int pid,int mem_limit,int time_limit) {
    struct rusage usage;
    int sig,status,result,used_time=0;
    while(1) {
        int wait_result=waitpid(pid,&status,WNOHANG);
        if(wait_result>0) {
            //Exited, evalutate RE, etc.
            getrusage(RUSAGE_CHILDREN,&usage);
            used_time=usage.ru_stime.tv_sec*1000+usage.ru_stime.tv_usec/1000;
            used_time+=usage.ru_utime.tv_sec*1000+usage.ru_utime.tv_usec/1000;

            fprintf(stdout,"====================\n");
            fprintf(stdout,"PID:    %d\n",pid);
            fprintf(stdout,"STATUS: %d\n",WEXITSTATUS(status));
            fprintf(stdout,"TIME:   %d\n",used_time);

            //evaluate result
            sig=WTERMSIG(status);
            fprintf(stderr,"Compiler terminated with signal %d\n",sig);
            FILE *err = fopen("compile_error.txt","a");
            fprintf(err,"\nCompiler terminated with signal: %d",sig);
            result=(WEXITSTATUS(status)==0?1:0);
            fclose(err);
            break;
        }
    }
    fprintf(stdout,"RESULT: %d\n",result);
    fprintf(stdout,"====================\n");
    write_json(result);
    return;
}
int main(int argc,const char *argv[]) {
    //.build
    int mem_limit,time_limit;
    #ifdef DFLAG
    printf("DFLAG on\n");
    #endif // DFLAG
    system("cp /judgeData/source.cpp source.cpp");
    int pid=fork();
    if(pid==0) run_code(mem_limit,time_limit);
    else {
        watch_code(pid,mem_limit,time_limit);
        system("mv -f compile_result.json /judgeData/compile_result.json");
        system("mv -f compile_error.txt /judgeData/compile_error.txt");
        system("mv -f compile_out.txt /judgeData/compile_out.txt");
        system("mv -f run /judgeData/run");
    }
}
