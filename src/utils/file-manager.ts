import fs, { PathLike } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getUploadsDir = () => {
  const uploadsDir = path.join(__dirname, "../", "../", "/uploads");
  return uploadsDir;
};

const mkDir = (dir: PathLike) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

type SaveFileInput = {
  file: Buffer<ArrayBufferLike>;
  savePath: PathLike;
};
const saveFile = ({ file, savePath }: SaveFileInput) => {
  const filename = path.basename(savePath.toString());
  const dirname = path.dirname(path.join(getUploadsDir(), savePath.toString()));

  mkDir(dirname);

  fs.writeFileSync(path.join(dirname, filename), file);
};

export { saveFile };
