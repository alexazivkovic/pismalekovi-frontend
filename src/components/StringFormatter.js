export function formatDateTime(dateString) {
  if (!dateString) return "/";
  const regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/;
  const matches = dateString.match(regex);
  var readableDate = dateString;

  if (matches) {
    const year = matches[1];
    const month = matches[2];
    const day = matches[3];
    const hour = matches[4];
    const minute = matches[5];
    const second = matches[6];

    readableDate = `${day}/${month}/${year} ${hour}:${minute}`;
  } else {
    console.log("Invalid date format");
  }
  return readableDate;
} 

export function formatBool(value) {
  return value ? "Da" : "Ne";
}