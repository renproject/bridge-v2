const timeFormatLocale = "en-US";

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
  const date = dateObject.toLocaleDateString(navigator.language, dateOptions);
  const time = dateObject.toLocaleTimeString(timeFormatLocale, timeOptions);
  return { date, time };
};

export const getHours =(milliseconds: number) => {
  return Math.floor(milliseconds / (1000 * 60 * 60));
}

export const millisecondsToHMS = (milliseconds: number) => {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / 1000 / 60) % 60);
  // take absolute hours as they may be greater than 24
  const hours = getHours(milliseconds);
  return { hours, minutes, seconds };
};

const pad = (value: number) => {
  return String(value).padStart(2, "0");
};

export const getFormattedHMS = (milliseconds: number) => {
  const { hours, minutes, seconds } = millisecondsToHMS(milliseconds);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
