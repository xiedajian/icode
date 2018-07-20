$(function () {

    $('#captureVisibleTab').on('click',function () {
        chrome.tabs.captureVisibleTab(null, {format: "png", quality: 100}, function(data) {
            var image = new Image();
            image.onload = function() {
                var width = image.width;
                var height = image.height;

                console.log(width);
                console.log(height);
            };
            image.src = data;
            $('#res').html('<img src="'+data+'">');
        });
    });






    function gotStream(stream) {
        console.log("Received local stream");
        var video = document.querySelector("video");
        video.src = URL.createObjectURL(stream);
        localstream = stream;
        stream.onended = function() { console.log("Ended"); };
    }

    function getUserMediaError() {
        console.log("getUserMedia() failed.");
    }

    function onAccessApproved(id) {
        if (!id) {
            console.log("Access rejected.");
            return;
        }
        navigator.webkitGetUserMedia({
            audio:false,
            video: { mandatory: { chromeMediaSource: "desktop",
                chromeMediaSourceId: id } }
        }, gotStream, getUserMediaError);
    }

    var pending_request_id = null;

    document.querySelector('#start').addEventListener('click', function(e) {
        pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
            ["screen"], onAccessApproved);
    });

    document.querySelector('#cancel').addEventListener('click', function(e) {
        if (pending_request_id != null) {
            chrome.desktopCapture.cancelChooseDesktopMedia(pending_request_id);
        }
    });
    document.querySelector('#getCount').addEventListener('click', function(e) {
        // var bg = chrome.extension.getBackgroundPage();

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
        {
            chrome.tabs.sendMessage(tabs[0].id, {getcount:true}, function(response)
            {
                console.log(response);
                // $("#contres").html(response.result);


            });
        });



    });
    var canvas_data = {
        size: {full_width: 0, full_height: 0, page_width: 0, page_height:0},
        table:{rows: 0, colums: 0},
        screenshots: []
    };

    function saveCapter() {
        chrome.tabs.captureVisibleTab({format:'png'}, function(screenshotUrl) {
            canvas_data.screenshots.push({data_url: screenshotUrl});
            $('#res').append('<img src="'+screenshotUrl+'">');
        });
    }

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
    {
        console.log('收到来自content-script的消息：');
        if(request.cap){
            console.log('cap');
            saveCapter();
        }
        // console.log(request, sender, sendResponse);
    });

});


