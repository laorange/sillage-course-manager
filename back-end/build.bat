SET GOOS=linux
go build main.go

SET GOOS=windows
go build main.go

pause