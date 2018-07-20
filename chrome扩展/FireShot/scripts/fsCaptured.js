//********************************************************************************************************
// FireShot - Webpage Screenshots and Annotations
// Copyright (C) 2007-2017 Evgeny Suslikov (evgeny@suslikov.ru)
//********************************************************************************************************

window.addEventListener('load', function () {
	
	var backgroundPage = null, pendingDID, onChangedEventActivated = false,
        capResultDataURL, capResult, capLinks, capResultFileNameLite;
	const cShowAlert1OptionName = "showAlert1";
	
	function setupAccessibility()
	{
        if (!backgroundPage.getAdvancedFeaturesAvailable())
            $("#spnAdvancedFeaturesSection").hide();

        if (isWindows())
			$("#divPromo,#upgradeLink,#noflashgoadvanced,#noflashgoadvanced2,#noflashgoadvanced3").removeClass("hiddenInitially");

        if (getOption(cTemplateNumberPref, 1) < 6) $("#lnkRecommend").hide();

	}

	/***************************************************************************************/
	
	function initHandlers()
	{
		$("#btnPrint").click(function() {
			var iframe = document.createElement("IFRAME");
			
			$(iframe).attr({
				style: "width:0px;height:0px;",
				id: "fsTempElement"
			});
			
			document.body.appendChild(iframe);
			//noinspection HtmlUnknownTarget
            iframe.contentWindow.document.write("<div style='margin:0 auto;text-align:center'><img style='width:100%' src='" + document.getElementById("imgResult").src + "'></div>");
		
			iframe.contentWindow.print(); 
			$("#fsTempElement").remove();
		});
		
		$("#lnkOptions, #lnkOptions1").click(function() {
			backgroundPage.openExtensionPreferences();
		});

        $("#lnkInstallAdvanced, #lnkInstallAdvanced2, #lnkInstallAdvanced3, #lnkInstallAdvanced4").click(function() {
            backgroundPage.installNative();
            return false;
        });


		
		$("#lnkRecommend").click(function() {
			backgroundPage.openURL("http://getfireshot.com/like.php?browser=" + (isOpera() ? "op" : "ch") + "&ver=" + backgroundPage.extVersion);
		});
		
		$("#btnCloseAlert1").click(function() {
			localStorage[cShowAlert1OptionName] = 0;
		});


        $("#btnSaveImage").click(function() {
            downloadToFile(capResultDataURL, capResultFileNameLite + "." + getOption(cDefaultImageFormatPref, "png"));
        });

        $("#btnSaveImagePDF").click(function() {
            var t = new backgroundPage.fsPDF(capResult, capLinks).toDataURL();
            downloadToFile(t, capResultFileNameLite + ".pdf");
        });

        $("#btnSendEmail").find("li").click(function() {
            sendEmailAs($(this).attr("value"));
        });

	}

    /***************************************************************************************/

    function sendEmailAs(format) {
        var dataUrl, ext = format;

        switch(format) {
            case "png": dataUrl =  capResult.toDataURL("image/png"); break;
            case "jpg": dataUrl =  capResult.toDataURL("image/jpeg"); break;
            default: dataUrl = new backgroundPage.fsPDF(capResult, capLinks).toDataURL(); ext="pdf";
        }

        var filename = capResultFileNameLite + "." + ext;
        var dataObj = {
            to: "",
            subject: "Screenshots from FireShot",
            files: [{
                inline: "no",
                name: encodeURIComponent(filename),
                data: dataUrl
            }]
        };

        backgroundPage.openInGmail(JSON.stringify(dataObj));
    }


    /***************************************************************************************/

    function downloadToFile(data, filename, fallback) {
        addDownloadsPermission(function() {

            if (!onChangedEventActivated) {
                onChangedEventActivated = true;

                chrome.downloads.onChanged.addListener(function(delta) {
                    if (!delta.state ||
                        (delta.state.current != 'complete')) {
                        return;
                    }

                    if (getOption(cOpenFolderAterSavingPref) === "true")
                        chrome.downloads.show(pendingDID);

                    if (getOption(cCloseTabAfterSaving) === "true")
                        window.close();
                });
            }

            chrome.downloads.download({
                url: data,
                saveAs: getOption(cNoFilenamePromptPref) !== "true",
                filename: fallback ? filename : getOption(cDefaultFolderPref, cDefaultFolderValue) + "/" + filename,
                conflictAction: "overwrite"
            },function(downloadId){
                if (!chrome.runtime.lastError)
                    pendingDID = downloadId;
                else if (!fallback) {
                    downloadToFile(data, filename, true);
                }
            });
        });
    }

	/***************************************************************************************/
	
	function showWarnings()
	{
		if (isWindows() && localStorage[cPluginProModePref] && localStorage[cShowAlert1OptionName] === undefined)
			setTimeout(function() {$("#divAlert1").fadeIn(700)}, 1000);
	}
	
	/***************************************************************************************/
	
	function showPage()
	{
		$(".container").show();

        document.getElementById("imgResult").onload = function() {
            var img = capResult;
            var div = document.getElementById("divImgResult");
            if (img.width < $(div).width())
            {
                $("#imgResult").css("width", "auto");
                $("#divImgResult").css("overflow-y", div.clientHeight < div.scrollHeight ? "scroll" : "hidden");
                div.style.zoom = 1.0000001;
                setTimeout(function(){div.style.zoom = 1;},50);
            }

            else if (div.clientHeight >= div.scrollHeight)
            {
                $(div).css("overflow-y", "hidden");
                div.style.zoom = 1.0000001;
                setTimeout(function(){div.style.zoom = 1;},50);
            }
        };

        document.getElementById("imgResult").src = capResultDataURL;
		document.title = capResultFileNameLite;//backgroundPage.tabTitle + " (" + backgroundPage.tabURL + ")";
	}

	
	/***************************************************************************************/
	
	function init()
	{
	
		try {
			i18nPrepare();
		} 
		catch (e) {logError(e.message);}
		
		chrome.runtime.getBackgroundPage(function (bp) {
			if (!bp) return;
			
			backgroundPage = bp;
            capResultDataURL = backgroundPage.capResultDataURL;
            capResult = backgroundPage.capResult;
            capLinks = backgroundPage.capLinks;
            capResultFileNameLite = backgroundPage.capResultFileNameLite;
			
			setupAccessibility();
			initHandlers();
			
			showPage();
			showWarnings();
		});
	}
	
	init();
});