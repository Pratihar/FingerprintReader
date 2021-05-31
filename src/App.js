import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

// http://www.accesscomputech.com/assets/pdf/ACPL_RD_WIN_PROGRAMMER_MANUAL.pdf

function App() {
  const [detectedPort, setDetectedPort] = React.useState(null);
  const [fingerprint, setFingerprint] = React.useState(null);

  function info() {
    var urlStr = "http://localhost:" + detectedPort + "/rd/info";
    getJSON_info(urlStr, function (err, data) {
      console.log(data);
      if (err != null) {
        alert("Something went wrong: " + err);
      } else {
        alert("Response:-" + String(data));
      }
    });
  }
  var getJSON_info = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("DEVICEINFO", url, true);
    xhr.responseType = "text";
    xhr.onload = function () {
      var status = xhr.status;
      if (status == 200) {
        callback(null, xhr.response);
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
          alert("Response:-" + String(data));
        }
      });
    }
  }
  var getJSON_rd = function (port, callback) {
    var url = "http://127.0.0.1:" + port;
    var xhr = new XMLHttpRequest();
    xhr.open("RDSERVICE", url, true);
    xhr.responseType = "text";
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
        alert("Response:-" + String(data));
        setFingerprint(data);
      }
    });
  }

  var getJSONCapture = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("CAPTURE", url, true);
    xhr.responseType = "text"; //json
    var InputXml =
      '<PidOptions> <Opts fCount="1" fType="0" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="20000" otp="" posh="" env="S" wadh="" /> <Demo></Demo> <CustOpts> <Param name="" value="" /> </CustOpts> </PidOptions>';
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
            disabled={fingerprint === null ? true : false}
            type="text"
            className="form-control"
            placeholder="Adhaar Number"
            aria-label="Adhaar Number"
            aria-describedby="basic-addon2"
          />
          &nbsp;
          <button
            disabled={fingerprint === null ? true : false}
            onClick={() => captureFPAuth()}
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
