/*
   Nging is a toolbox for webmasters
   Copyright (C) 2018-present Wenhui Shen <swh@admpub.com>

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU Affero General Public License as published
   by the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU Affero General Public License for more details.

   You should have received a copy of the GNU Affero General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

package index

import (
	"github.com/webx-top/echo"

	"github.com/coscms/webcore/middleware"
	"github.com/coscms/webcore/registry/route"
	"github.com/coscms/webcore/request"

	// oauth2server
	"github.com/coscms/webcore/library/backend/oauth2server/initialize"
	"github.com/coscms/webcore/library/httpserver"
)

func init() {
	initialize.Init(Login, Logout)
	route.Register(func(e echo.RouteRegister) {
		e.Route("GET", ``, Index)
		e.Route("GET", `/`, Index)
		e.Route("GET", `/project/:ident`, Project).SetMetaKV(httpserver.PermPublicKV())
		e.Route("GET", `/index`, Index)
		e.Route("GET,POST", `/login`, Login)
		e.Route("GET,POST", `/register`, route.HandlerWithRequest(Register, request.Register{}, `POST`))
		e.Route("GET", `/logout`, Logout)
		//e.Route(`GET,POST`, `/ping`, Ping)
		e.Get(`/icon`, Icon, middleware.AuthCheck)
		e.Get(`/routeList`, RouteList, middleware.AuthCheck)
		e.Get(`/routeNotin`, RouteNotin, middleware.AuthCheck)
		e.Get(`/navTree`, NavTree, middleware.AuthCheck)
		e.Get(`/headers`, Headers, middleware.AuthCheck)
	})
}
