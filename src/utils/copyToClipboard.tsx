export const copyToClipboard = (value: string) => {
  const fauxInput = document.createElement("input");
  document.body.appendChild(fauxInput);
  fauxInput.setAttribute("value", value);
  fauxInput.select();
  navigator.clipboard.writeText(value).then(() => {
    // Alert the user that the action took place.
    // Nobody likes hidden stuff being done under the hood!
  });
  document.execCommand("copy");
  document.body.removeChild(fauxInput);
};

export const copyToClipboardAsync = async (value: string) => {
  return navigator.clipboard.writeText(value);
};
