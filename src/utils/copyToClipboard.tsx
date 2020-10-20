export const copyToClipboard = (value: string) => {
  const fauxInput = document.createElement("input");
  document.body.appendChild(fauxInput);
  fauxInput.setAttribute("value", value);
  fauxInput.select();
  document.execCommand("copy");
  document.body.removeChild(fauxInput);
};
