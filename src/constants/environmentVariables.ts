const TARGET_NETWORK = process.env.REACT_APP_TARGET_NETWORK || "";
const INFURA_KEY = process.env.REACT_APP_INFURA_KEY  || "";

export const env = {
  TARGET_NETWORK,
  INFURA_KEY,
};

console.log("env", env, process, env);
