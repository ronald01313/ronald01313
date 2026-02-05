import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";


export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx", { id: "home" }),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("profile", "routes/profile.tsx"),
    route("create", "routes/create.tsx"),
    route("post/:id", "routes/post.tsx"),
    route("manage", "routes/manage.tsx"),
  ])
] satisfies RouteConfig;
