export const uniqueArray = (arrArg: any) => {
  return arrArg.filter((elem: any, pos: number, arr: Array<any>) => {
    return arr.indexOf(elem) === pos;
  });
};
