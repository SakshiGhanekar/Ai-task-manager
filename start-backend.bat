@echo off
set "JAVA_HOME=C:\Users\saksh\.p2\pool\plugins\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_23.0.1.v20241024-1700\jre"
set "PATH=%JAVA_HOME%\bin;%PATH%"

cd backend
echo Starting Spring Boot Backend...
call mvnw.cmd clean spring-boot:run
pause
