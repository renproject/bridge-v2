const locale = "en-US";

const timeZone = "UTC";

export const dateOptions: Intl.DateTimeFormatOptions = {
  timeZone,
};

export const timeOptions: Intl.DateTimeFormatOptions = {
  hour12: false,
  timeZone,
  timeZoneName: "short",
};

export const getFormattedDateTime = (timestamp: number) => {
  const dateObject = new Date(timestamp);
  const date = dateObject.toLocaleDateString(locale, dateOptions);
  const time = dateObject.toLocaleTimeString(locale, timeOptions);
  return { date, time };
};
