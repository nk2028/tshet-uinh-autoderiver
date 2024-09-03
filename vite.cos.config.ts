import { makeConfig } from "./vite.config";

// Same as base config but prefix each asset path in index.html with this location
export default makeConfig("https://autoderiver-1305783649.cos.accelerate.myqcloud.com/");
