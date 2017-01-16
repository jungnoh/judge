// Online Judge Runner Application
// Written for [C++11]
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
/*
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
}*/
int main(int argc, const char * argv[]) {
    const char *runCmd = "g++";
    system("cp /judgeData/source.cpp source.cpp");
    //int memLimit=1024<<10, timeLimit=60;
    int pid = fork();
    if(pid==0) {
        int fdout = open("compile_out.txt", O_RDWR | O_CREAT, 0664 | O_TRUNC);
        int fderr = open("compile_error.txt", O_RDWR | O_CREAT, 0664 | O_TRUNC);
        dup2(fdout,STDOUT_FILENO);
        dup2(fderr,STDERR_FILENO);
        rlimit lim;
        //Stack size limit
        //lim.rlim_cur=lim.rlim_max=memLimit<<10;
        //setrlimit(RLIMIT_STACK,&lim);
        //Memory size limit (extra limit)
//        lim.rlim_cur=lim.rlim_max=((memLimit<<10)*3)/2;
//        setrlimit(RLIMIT_AS,&lim);
        //File size limit
        lim.rlim_cur=lim.rlim_max=FILE_LIM;
        setrlimit(RLIMIT_FSIZE,&lim);
        //Time limit
        //lim.rlim_cur=timeLimit;
        //lim.rlim_max=timeLimit+3;
        //setrlimit(RLIMIT_CPU,&lim);
        //alarm(0);
        //alarm(timeLimit+1);
        execlp(runCmd,runCmd,"source.cpp","-o","run","-std=c++11","-O2","--static","-Wall");
        exit(0);
    }
    else {
        rusage usage;
        int sig,status,maxMem=0,tempMem=0,result;
        long usedTime;
//        if(maxMem==0) maxMem=getMem(pid);
        while(1) {
            wait4(pid,&status,0,&usage);
/*
            tempMem=getMem(pid);
            if(tempMem>maxMem)
                maxMem=tempMem;
            if(maxMem>memLimit) {
                fprintf(stderr,"Memory Limit Exceeded");
                kill(pid, SIGKILL);
                result=0;
                break;
            } */
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
                result=(exitCode==0?1:0);
                break;
            }
            if(WIFSTOPPED(status)) {
                printf("<%d>",sig);
            }
        }
        //finish up
        FILE *res=fopen("compile_result.json","w");
        fprintf(res,"{\"res\":%d}\n",result);
        fclose(res);
        system("mv compile_result.json /judgeData/compile_result.json");
        system("mv compile_error.txt /judgeData/compile_error.txt");
        system("mv compile_out.txt /judgeData/compile_out.txt");
        system("mv run /judgeData/run");
    }
}
