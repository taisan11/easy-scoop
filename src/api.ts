import { Hono } from "hono";
import {scoop_app_manifest,builder_type} from "./types"
import * as v from "valibot";

const app = new Hono();

app.get("/",(c)=>{return c.json({message:"Hello, World!"})});

app.post("/validate",async(c)=>{
    const data = await c.req.json();
    const result = v.safeParse(data,scoop_app_manifest);
    return c.json(result);
});

app.post("/create-app",async(c)=>{
    const data = await c.req.json();
    const manifest = v.safeParse(data.scoop_app_manifest,scoop_app_manifest);
    const builder = v.safeParse(data.builder_type,builder_type);
    if (!(manifest.success || builder.success)) {
        return c.json({error:"Validation error",manifest:manifest,builder:builder});
    }

})

export default app;