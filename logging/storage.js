import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Storage {
    constructor(object = {}) {
        this.basePath = path.join(
            __dirname,
            "logging",
            object.identifier || "DEFAULT"
        );

        fs.mkdirSync(this.basePath, { recursive: true });
    }

    get(key) {
        const filePath = path.join(this.basePath, key);
        if (!fs.existsSync(filePath)) return null;

        const value = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(value);
    }

    set(key, value) {
        const filePath = path.join(this.basePath, key);
        fs.writeFileSync(filePath, JSON.stringify(value, null, 4));
    }

    delete(key){
        let filePath = path.join(this.basePath,key)
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
        }
    }
}

export default Storage;
