import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import * as CryptoJS from "crypto-js";
import * as EncryptJS from "jsencrypt";

// http://www.accesscomputech.com/assets/pdf/ACPL_RD_WIN_PROGRAMMER_MANUAL.pdf

function App() {
  const [detectedPort, setDetectedPort] = React.useState(null);
  const [fingerprint, setFingerprint] = React.useState(null);
  const [deviceInfo, setDeviceInfo] = React.useState(null);

  var encrypt = new EncryptJS.JSEncrypt();

  encrypt.setPublicKey(
    "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAsIwVStQi6aSMLBZu3vhafOR5NTMNp+TXPwyk/6VoaSQfDnZaSQPYhdt4a8X215KwXwpIL1eBJOH2NW8jp5AO4WauHWEwEggJvPaC8FgzZtDhjYexOk+/yaDbY7U9BofJSU76VIBxRoN7YmAknAKrpfn0ukXPPuUx5Ny/cy85nunqo5M8Acf2VVwSGZQMBZFSm3yxYOdS4laDlM+s1w+5wLDMjYSgIMm76rpVdO3hs2n2dSAYM6XMOaqNDwHdZk6n8lPgivYVXjTz7KU9eqkFnecWvn2ugRI7hgrplZxS020k0QBeYd0AH7zJZKS3Xo5VycL01UO/WYOQvB7v8lge7TiQZ3CCrnuykqcJ/r5DMLO/cKQAeZi+LQ95FQg39joO8G7bfO7+a3Gs8Re3mRW7AA8x1aEn7XZMOUu4l4IfNvwh20V4cz3xvGXdr9ZLFvgX5593MxCDBjkiaynzG8gmLVTIoaItPy+khwO/vjfWka0L3yvT3l55R4H/KRKxlHaY58HVdLbuWrUoH/4gbkYFYFC+rejBW5wbE0FJmWIkEXLKsTlXcsn6eAzi4BRxidQ/4rIEf8qWpSFzJobivBnWe4bpBA19g3N47PDpD5xS6uj7ODSBhEn22UnsiDaGV+RhsXYA/xqaJCjB6+W7CN00Lowr87sUoT4VAK8wrOk4D5sCAwEAAQ=="
  );

  var randomNumber = "1111222233334444";

  function generateEncryptedKey() {
    var encryptedData = encrypt.encrypt(randomNumber);
    return encryptedData;
  }

  function aesEncrypt(data, key, iv) {
    const cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Utf8.parse(iv), // parse the IV
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    return cipher.toString();
  }

  function info() {
    var urlStr = "http://localhost:" + detectedPort + "/rd/info";
    getJSON_info(urlStr, function (err, data) {
      if (err != null) {
        alert("Something went wrong: " + err);
      } else {
        setDeviceInfo(data.getElementsByTagName("DeviceInfo")[0]);
        alert(
          "Response:-" +
            new XMLSerializer().serializeToString(data.documentElement)
        );
      }
    });
  }
  var getJSON_info = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("DEVICEINFO", url, true);
    xhr.responseType = "document";
    xhr.onload = function () {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.responseXML);
      } else {
        callback(status);
      }
    };
    xhr.send();
  };

  function rdservice() {
    for (var i = 11100; i <= 11120; i++) {
      if (detectedPort) break;

      getJSON_rd(i, function (err, data) {
        if (err === null) {
          console.log(data);
          alert(
            "Response:-" +
              new XMLSerializer().serializeToString(data.documentElement)
          );
        }
      });
    }
  }
  var getJSON_rd = function (port, callback) {
    var url = "http://127.0.0.1:" + port;
    var xhr = new XMLHttpRequest();
    xhr.open("RDSERVICE", url, true);
    xhr.responseType = "document";
    xhr.onload = function () {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
        setDetectedPort(port);
      } else {
        callback(status);
      }
    };
    xhr.send();
  };

  function captureFPAuth() {
    var urlStr = "http://localhost:" + detectedPort + "/rd/capture";
    getJSONCapture(urlStr, function (err, data) {
      if (err != null) {
        alert("Something went wrong: " + err);
      } else {
        console.log(data);
        // alert("Response:-" + String(data));
        // setFingerprint(data.getElementsByTagName("PidData")[0]);
        setFingerprint(data);
      }
    });
  }

  var getJSONCapture = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("CAPTURE", url, true);
    xhr.responseType = ""; //json

    var utf8arr = CryptoJS.enc.Utf8.parse("2.5FYNNN");
    var hash = CryptoJS.SHA256(utf8arr);
    var base64 = CryptoJS.enc.Base64.stringify(hash);

    var InputXml = `<PidOptions ver="1.0"> <Opts WADH="${base64}" fCount="1" fType="0" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" pTimeout="20000" posh="UNKNOWN" env="PP" /> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>`;

    xhr.onload = function () {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send(InputXml);
  };

  function verifyFingerprint(aadhaarNo) {
    var urlStr = "https://icici-nonprod-uat.apigee.net/api/v0/ABKYC_Req";
    console.log(fingerprint);
    postData({
      aadhaar_no: aadhaarNo,
      finger_data: fingerprint,
    });
    // postFingerprint(aadhaarNo, urlStr, function (err, data) {
    //   if (err != null) {
    //     alert("Something went wrong: " + err);
    //   } else {
    //     console.log(data);
    //     alert("Response:-" + String(data));
    //   }
    // });
  }

  function pad2(n) {
    return n < 10 ? "0" + n : n;
  }

  // Example POST method implementation:
  async function postData(data = {}) {
    // Default options are marked with *
    const response = await fetch("http://192.168.1.5:3000/bkyc", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    console.log(response.json());
    return response.json(); // parses JSON response into native JavaScript objects
  }

  var postFingerprint = function (uid, url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("apiKey", "9HASuu1dUdivJNRy1SY1RlyNLbJinKMZ");
    xhr.setRequestHeader("Content-type", "application/json");

    var date = new Date();

    var transactionRequest = `<TransactionReqInfo><Channel>MATM</Channel><TxnType>bkyc</TxnType>
    <Local_Trans_Time>${
      pad2(date.getHours()) +
      "" +
      pad2(date.getMinutes()) +
      "" +
      pad2(date.getSeconds())
    }</Local_Trans_Time> <Local_date>${
      pad2(date.getMonth() + 1) + pad2(date.getDate())
    }</Local_date>
    <Pan_entry_mode>MN</Pan_entry_mode> <Pos_code>CPCN</Pos_code> <CA_ID>ICI000001017233</CA_ID>
    <CA_TA>kaabilfinancebiokyctestjaipurxxxxxxxRJIN</CA_TA> </TransactionReqInfo>`;

    var uidaiData = `<UidaiData>${new XMLSerializer().serializeToString(
      fingerprint.getElementsByTagName("Data")[0]
    )}${new XMLSerializer().serializeToString(
      fingerprint.getElementsByTagName("Hmac")[0]
    )}${new XMLSerializer().serializeToString(
      fingerprint.getElementsByTagName("Skey")[0]
    )}</UidaiData> `;

    let data = `<ReqData>${transactionRequest + uidaiData}</ReqData>`;
    console.log(data);
    let key = "xKTuMytSUHxTwey9LVtkfXUR";

    let cypher = CryptoJS.TripleDES.encrypt(
      data,
      CryptoJS.enc.Utf8.parse(key),
      {
        mode: CryptoJS.mode.ECB,
      }
    );

    var InputXml = `<MAS_Request de="N" lr="N" pfr="N" ra="F" rc="Y" tid="registered" ver="2.5"><UID>${uid}</UID><Terminal_Ip>APIKAABIL</Terminal_Ip><ReqId>${
      date.getFullYear().toString() +
      pad2(date.getMonth() + 1) +
      pad2(date.getDate()) +
      pad2(date.getHours()) +
      pad2(date.getMinutes()) +
      pad2(date.getSeconds())
    }112233</ReqId><Uses bio="y" bt="FMR" otp="n" pa="n" pfa="n" pi="n" pin="n"/><Meta dc="${deviceInfo.getAttribute(
      "dc"
    )}" dpId="${deviceInfo.getAttribute("dpId")}" mc="${deviceInfo.getAttribute(
      "mc"
    )}" mi="${deviceInfo.getAttribute("mi")}" rdsId="${deviceInfo.getAttribute(
      "rdsId"
    )}" rdsVer="${deviceInfo.getAttribute(
      "rdsVer"
    )}"/><ReqData>${cypher}</ReqData></MAS_Request>`;

    console.log(InputXml);

    var oaepHashingAlgorithm = "NONE";
    // var encryptedKey =
    //   "ZcUCkJG3kS3P+dCodxUcH+rJ2nEtOH690BbsVzBUqC2dUZOwyQLAxP2F1R0GG5Hg1i5LGCBoXbG8fH7Ig2iKItoCdzOe8DkgoLFcivs/iw3fQBVK5Nt0FiAPcOAwwdJoLdD5+Tga9564Nu2dc1LJrl0IwZIBbfmLwPHoEL89N6I8nOeL+2V29OaIw6nzJZTqfFCp2kjX5279W2U2+Yn1MEgRZFP+fpp7PRuLC+c2IPs2LEPMD0uCw/lI8FJoa+C5cWBFZ5P2RIep2g3c1I5fhcfUxU5IIqZ1NwvfF/LWBbunCPrvGPpmzaYXxKPwGLwMH/tg1EcaNrk3zlDBSMvtvejuh+MaYY+7COvY4nziqCjgfdBugLuX1RNwTuNwPyfRhcZKEixsHhYo+dONf2GGeWsPIjP5+jNJFF6AUJDFISc8QCdZFTPjCSl/+UDBgXYChxKO3wn6vDc/32Wbj+A01Wk1nltthuSIm0Q4JgUcDbkfS8zqiYQL74GNN9uvUZBC3tBkaB2Vha0KLjGUAQ9aqJbbRj4sD7MKleRlL9NhGvYTjhOIUrD//JZRX2AiLR9kwTRiesE4mgyAeN7LpmMl1Pb2ySQDk2rQ9xqXJJW6gJLXz583jGXiqiLUFP6grmSDGW4jVe91r2I+/KPJwgeq0idu1j1YNVAdOAdio+QoPMU=";
    var encryptedKey = generateEncryptedKey();
    var iv = CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(randomNumber)
    );
    var encryptedData = aesEncrypt(InputXml, randomNumber, randomNumber);

    console.log(encryptedKey, encryptedData);

    xhr.onload = function () {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };

    var json = {
      requestId: "",
      service: "",
      encryptedKey,
      oaepHashingAlgorithm,
      iv,
      encryptedData,
      clientInfo: "",
      optionalParam: "",
    };

    console.log(json);

    xhr.send(
      JSON.stringify({
        requestId: "",
        service: "",
        encryptedKey,
        oaepHashingAlgorithm: "NONE",
        iv: "MTExMTIyMjIzMzMzNDQ0NA==",
        encryptedData,
        clientInfo: "",
        optionalParam: "",
      })
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fingerprint Reader</h1>
        <br />
        <div className="col-md-6 d-flex justify-content-around">
          <button
            onClick={() => rdservice()}
            type="button"
            className="btn btn-primary"
          >
            Detect
          </button>
          <button
            disabled={detectedPort === null ? true : false}
            onClick={() => info()}
            type="button"
            className="btn btn-primary"
          >
            Device Info
          </button>
          <button
            disabled={detectedPort === null ? true : false}
            onClick={() => captureFPAuth()}
            type="button"
            className="btn btn-primary"
          >
            Capture
          </button>
        </div>
        <br />
        <br />
        <div className="col-md-6 d-flex justify-content-around">
          <input
            id="aadhaar"
            disabled={fingerprint === null ? true : false}
            type="text"
            className="form-control"
            placeholder="Aadhaar Number"
            aria-label="Aadhaar Number"
            aria-describedby="basic-addon2"
          />
          &nbsp;
          <button
            disabled={fingerprint === null ? true : false}
            onClick={() =>
              verifyFingerprint(document.getElementById("aadhaar").value)
            }
            type="button"
            className="btn btn-primary"
          >
            Verify
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
