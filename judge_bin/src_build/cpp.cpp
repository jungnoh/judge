// C++ Build
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
#define NOBODY -2
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
int main(int argc, const char * argv[]) {
    // ./run [work path]
    const char *runCmd = "g++", *path=argv[1];
    int memLimit=256<<10,timeLimit=10; //timeLimit in seconds, memLimit in MBs
    int pid = fork();
    if(pid==0) {
        rlimit lim;
        //Process count limit
        lim.rlim_cur=lim.rlim_max=PROCESS_COUNT_LIM;
        setrlimit(RLIMIT_NPROC,&lim);
        //Time limit
        lim.rlim_cur=timeLimit;
        lim.rlim_max=timeLimit+3;
        setrlimit(RLIMIT_CPU,&lim);
        chdir(path);
        execlp(runCmd,runCmd,"source.cpp","-o","run","-O2","--static","-Wall");
        exit(0);
    }
    else {
        rusage usage;
        int sig,status,result;
        long long maxMem=0,tempMem=0;
        long long usedTime;
        pid_t pid2;
        while(1) {
            wait4(pid,&status,0,&usage);
            if(WIFSIGNALED(status)) {
                sig=WTERMSIG(status);
                fprintf(stderr,"Compiler terminated with signal %d\n",sig);
                FILE *err = fopen("compile_error.txt","a");
                fprintf(err,"\nCompiler terminated with signal: %d",sig);
                fclose(err);
                result=0;
                break;
            }
            if(WIFEXITED(status)) {
                fprintf(stderr,"Exited\n");
                int exitCode = WEXITSTATUS(status);
                printf("1");
                result=(exitCode==0?1:0);
                printf("1");
                break;
            }
            if(WIFSTOPPED(status)) {
                printf("<%d>",sig);
            }
        }
        //finish up
        printf("yeah");
        chdir(path);
        FILE *res=fopen("compile_result.json","w");
        printf("1");
        usedTime=usage.ru_stime.tv_sec*1000+usage.ru_stime.tv_usec/1000;
        printf("1");
        usedTime+=usage.ru_utime.tv_sec*1000+usage.ru_utime.tv_usec/1000;
        printf("1");
        if(result==TLE) usedTime=timeLimit*1000;
        printf("1");
        fprintf(res,"{\"res\":%d}\n",result);
        printf("1");
        fclose(res);

    }
}
