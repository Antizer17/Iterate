

const apiKey = "1fe430b424cb4eb08fc61455e34a71de";

const res = await fetch(
  `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=test@example.com`
);

console.log("Status:", res.status);
console.log(await res.text());