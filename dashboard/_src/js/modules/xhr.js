export default function (url, obj, responseType = 'json') {
  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    const params = 'action=' + obj.action + '&data=' + JSON.stringify(obj.data);
    const urlArgs = url + '?' + params;

    xhr.open('POST', urlArgs);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json';

    xhr.onload = (res) => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(res);
      else reject('something bad happened')
    };

    xhr.send();
  });
};