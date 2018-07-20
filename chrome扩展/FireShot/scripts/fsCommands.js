//********************************************************************************************************
// FireShot - Webpage Screenshots and Annotations
// Copyright (C) 2007-2017 Evgeny Suslikov (evgeny@suslikov.ru)
//********************************************************************************************************

function openSettings()
{
	lockItems();
	pluginCommand("openSettings");
	unlockItems();
}

function openExtensionPreferences()
{
	chrome.tabs.create({url: "fsOptions.html"});
}

function doRegister()
{
	openURL("http://getfireshot.com/buy.php");
}

function openDemoPage()
{
	openURL("http://getfireshot.com/demo.php");
}

function openSupportPage()
{
	openURL("http://getfireshot.com/sup/frm12.htm");
}

function openAPIPage()
{
	openURL("http://getfireshot.com/api.php");
}

function openUnibluePromo()
{
	openURL("http://screenshot-program.com/registry-checker-lnk5.php");
}

function resumeEditing()
{
	lockItems();
	pluginCommand("resumeEditing");
	unlockItems();
}

function captureLastUsedMode()
{
	//if (isDebug) doTest();
    //else
        executeGrabber(getLastAction(), getLastMode());
}

function openCaptureSettings()
{
	lockItems();
	pluginCommand("ieCaptureOptions");
	unlockItems();	
}

function doUpgrade()
{
	lockItems();
	pluginCommand("upgradeToPro");
	unlockItems();	
}

function doTrial()
{
    gaTrack('UA-1025658-9', 'fireshot.com', "DoTrialChrome");
    lockItems();
    pluginCommand("upgradeToProTrial");
    unlockItems();
}

function enterLicense()
{
	lockItems();
	pluginCommand("enterLicense");
	unlockItems();	
}

function openFile()
{
	lockItems();
	pluginCommand("openFile");
	unlockItems();
}

function openClipboard()
{
	lockItems();
	pluginCommand("openFromClipboard");
	unlockItems();	
}

function notSupported()
{
	openURL("http://getfireshot.com/not-supported.php");
}

function showLicenseInfo()
{
	lockItems();
	pluginCommand("showLicensingInfo");
	unlockItems();
}

function showAbout()
{
	lockItems();
	pluginCommand("showAboutWindow");
	unlockItems();
}

function installNative()
{

    if (getAdvancedFeaturesAvailable())
        chrome.tabs.create({url: "fsNativeInstall.html"});
    else
        openURL("http://getfireshot.com/buy.php?SRC=ce-lite");
}

function openPermissionsPage() {
    if (fPermissionsPageOpened) return;
    fPermissionsPageOpened = true;
    chrome.tabs.create({url: "fsPermissions.html"});
}

function openGmailPermissionsPage() {
    chrome.tabs.create({url: "fsGmailPermissions.html"});
}

function openGmailComposer() {
    fInjectGmailScript = true;
    //chrome.tabs.create({url: "https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1"});
    chrome.tabs.create({url: "https://gmail.com"});
}


function doTest() {
}

