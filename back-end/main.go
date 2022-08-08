package main

import (
	"embed"
	"log"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

//go:embed dist
var dist embed.FS

// REFER TO: https://github.com/pocketbase/pocketbase/blob/master/examples/base/main.go
func main() {
	app := pocketbase.New()

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		subFs := echo.MustSubFS(dist, "dist")
		e.Router.GET("/*", apis.StaticDirectoryHandler(subFs, false))
		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
