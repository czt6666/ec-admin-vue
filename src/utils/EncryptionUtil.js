import {jsrsasign} from "jsrsasign";
import process from "shelljs";
import {JSEncrypt} from "jsencrypt";
var rs = require("jsrsasign")
var fs = require("fs")
var crypto = require("crypto")
// var JSEncrypt = require("jsencrypt")
let PRIVATE_KEY_CONSTANT =
  "-----BEGIN RSA PRIVATE KEY-----\n" +
  "MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCzaZIHceHFA/xP\n" +
  "iFDh9lCKfU2gDZrS+t4eBrBmy+2rK9Sr+hAworFTBMnyiq+YQN3glbDKB4qk44Ee\n" +
  "Yzb0peyV20pyU8k++4ZGhfZ31stKOZBAZaGqZON3O4Zt+E/lylwXk/wARQGZRF6/\n" +
  "fcJ+0hXIblpSZG267GPomM4L0kA3Sx2oh8SW1wfCx5N6tia1tBAWM97wDmh2XCOH\n" +
  "rVaqG4yDyJyjZMPkf1VvcBLKttUtA4CfpWW/EkeJA0M8ZjKJV0lyK+KMUCc/HJ6W\n" +
  "qo4Y/YUoh2oyR9SnD2FU36RBn1+nUydxzXYzZRxBZfqtYeh42lxjYnGpxmtSxrzZ\n" +
  "fqaqUJu/AgMBAAECggEAaokR0aHqMpc/R+rmPIeLI/FsGtJ5UTbull3aefA2XSJV\n" +
  "0xlWa8rwCSAa2w9HXd2G40mABTedOHRvw5+ejn/IkOP6vRDLu76X6WC7DkZZyOWN\n" +
  "pu+yo//somySUtLUfts+/DE/vtk7LcvPh14iFDSkArSkpbBFCG4+lWvHTnW29B2D\n" +
  "ck/4popS5LxTyc09zS7pImiAa3/m7DRh34uqs70dZpSW2swWSWBhSrnA9LvqL/ft\n" +
  "xA5zTQrc6UR/sKCwbmzkpyg8sRwBCnjBi8Qf4ekiWJk7Pu4iA42kMwEdt18vL1R+\n" +
  "7fTWp5FfelXlcVUBuAWpOwZUYX5r6SLcpoYNw/lWAQKBgQDmzouz5iQ9dlTdRwlJ\n" +
  "fv32TME6GysptiDTo4OYqWozbFsyOsmQYW+wXiaBFzai6r0PQBMrxYd06gZI1vsE\n" +
  "RotM3o3sDanopwDITTyovGQWLEkqTFAXEMJ9XgSGjuvRYMO7pFZsHBreu6nnYW7n\n" +
  "4NbXHtm6s7fDaAZRlZIvfaEw/wKBgQDG/ufdEuEXgeUk1ZllIZPF8dqdVRU5WyQy\n" +
  "DX2jzH0iptjQ9GolgPb/ia0PnoYEw6tDYM52Gn+S/sIwOa8Pvlq3AScOFrVIDPQN\n" +
  "MuTwS2kECZzs06vLeCXX71kZK0MTqprMwAv+Z8FW8VidBkGNmU6i3YwqZdfWJulS\n" +
  "+B/M6mHVQQKBgQDQazskHHIlPjGsD3WHdLGINA9YlSgI5noGIuW2eWV5QiOn3AYf\n" +
  "5pyguqQyde/Udfx7RPUK1bhYDuvV4quRVNJ9e4rU2hHQEN5YAccA5/3JN/xpwbeg\n" +
  "3HWEF94mU/EGhUa6rs+LmGV7NCNc2VL4+MOIRkd+nMMYJVtvWI1FbUCdqQKBgQCq\n" +
  "XyfIoRdSdwXmqXHxofPQ76aKOYQ4XQ36RI6jJLqmZk8PZ5NRlL7kPc2Lp996SMRi\n" +
  "pYlemIVNJwy/GUQGqKUmNbhoWYzPqTdx7XcRPJ8ms8xE/10AkVdlLykLYXzGY7Sx\n" +
  "RGOAZvijJXMGzYpmXzFyQ1h0HEnUse/l90XSvYERgQKBgQDK/W9jApQD8WdWelzT\n" +
  "BoNhAQbQ63RnjWgmK4Txpm6bcxFpkK7AfqOBF19thnoVE6hbgIjAQ8jVG3CHbKCw\n" +
  "XmrhEcBYlUZqEF68wS3cfXfIbJPhwH++xCCsveSPz4KSn84FhmafBb0CCuRu+l/s\n" +
  "v/N/gbNCrNP7eA4N5V9ruDPJ1g==\n" +
  "-----END RSA PRIVATE KEY-----"
let PUBLIC_KEY_CONSTANT =
  "-----BEGIN PUBLIC KEY-----\n" +
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs2mSB3HhxQP8T4hQ4fZQ\n" +
  "in1NoA2a0vreHgawZsvtqyvUq/oQMKKxUwTJ8oqvmEDd4JWwygeKpOOBHmM29KXs\n" +
  "ldtKclPJPvuGRoX2d9bLSjmQQGWhqmTjdzuGbfhP5cpcF5P8AEUBmURev33CftIV\n" +
  "yG5aUmRtuuxj6JjOC9JAN0sdqIfEltcHwseTerYmtbQQFjPe8A5odlwjh61WqhuM\n" +
  "g8ico2TD5H9Vb3ASyrbVLQOAn6VlvxJHiQNDPGYyiVdJcivijFAnPxyelqqOGP2F\n" +
  "KIdqMkfUpw9hVN+kQZ9fp1Mncc12M2UcQWX6rWHoeNpcY2JxqcZrUsa82X6mqlCb\n" +
  "vwIDAQAB\n" +
  "-----END PUBLIC KEY-----"
export function signData(text)
{

  //生成密钥对
  let keyPair = genRsaKeyPair(1024)
  // 获取公/密钥对象
  let publicKeyObj = keyPair.pubKeyObj
  let privateKeyObj = keyPair.prvKeyObj
  // const privateKeyPem = fs.readFileSync("D:\\1WEBOFD\\keyStore\\private.key","utf8")
  // 获取pem格式的密钥及公钥
  let pubKeyPem = rs.KEYUTIL.getPEM(publicKeyObj)
  let prvKeyPem = rs.KEYUTIL.getPEM(privateKeyObj,"PKCS8PRV")
  // let rsPrvKeyObj = rs.KEYUTIL.getKey(privateKey)

  let sig = new rs.KJUR.crypto.Signature({alg: "SHA256withRSA"});


  sig.init(prvKeyPem);
  sig.updateString(text)
  let retObj = {
    publickey: pubKeyPem,
    signature: rs.hextob64(sig.sign())
  }
  // 结果用base64加密
  return  btoa(JSON.stringify(retObj));
}

export function genRsaKeyPair(keysize){
  let keySize = parseInt(keysize);
  const rsaKey = new rs.KEYUTIL.generateKeypair("RSA",keySize)
  return rsaKey
}

export function  encrypt(str){
  let encryptObj = new JSEncrypt();
  encryptObj.setPublicKey(PUBLIC_KEY_CONSTANT);
  return encryptObj.encrypt(str);
}

export  function decrypt (encryptString){
  debugger
  let decryptObj = new JSEncrypt();
  decryptObj.setPrivateKey(PRIVATE_KEY_CONSTANT);
  return decryptObcrypt(encryptString);
}
