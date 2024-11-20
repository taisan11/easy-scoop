import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node'
import { apps,AppValue,builders,BuilderValue } from './types'

const app_adapter = new JSONFile<apps>('db.json');
const app = new Low(app_adapter,{});
const builder_adapter = new JSONFile<builders>('db.json');
const builder = new Low(builder_adapter, {});

export async function newapp(appData: AppValue): Promise<void> {
    app.data[appData.id] = appData;
    await app.write();
}

export async function newbuilder(builderData: BuilderValue): Promise<void> {
    builder.data[builderData.id] = builderData;
    await builder.write();
}

export async function getapp(id: string): Promise<AppValue | undefined> {
    await app.read();
    return app.data[id];
}

export async function getbuilder(id: string): Promise<BuilderValue | undefined> {
    await builder.read();
    return builder.data[id];
}

export async function serchapps(query:string): Promise<AppValue[]> {
    await app.read();
    return Object.values(app.data).filter((app) => app.name.includes(query));
}