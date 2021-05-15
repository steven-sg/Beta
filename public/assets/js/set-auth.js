if (
  document.referrer === "https://auth.steven-sg.com/"
) {
  const hashValues = window.location.hash.substring(1).split("&");
  const params = hashValues.reduce((acc, curr) => {
    [key, value] = curr.split("=");
    acc[key] = value;
    return acc;
  }, {});
  document.cookie = `id_token=${params["id_token"]}; Max-Age=${params["expires_in"]}; Secure;`;
}
