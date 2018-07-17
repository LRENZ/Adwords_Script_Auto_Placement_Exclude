



var TLDs = ['.cn' , '.hk','.in','.pk', '.tr','.ru'];
//var TLDs = ['.info','.br'];
var timePeriod = "LAST_30_DAYS"; 
var reportRows = [];
var exflag = "exclude"
// you need clone a sheet first click the following SPREADSHEET_URL
// click make a copy to clone the template
// paste your SPREADSHEET_URL to replace the following SPREADSHEET_URL
var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1Exyhk0MopoLCqftIiJuTwQK1z2x9IECXyRwK1BsOSmw/edit#gid=0'
  //Logger.log('Using spreadsheet - %s.', SPREADSHEET_URL);
  var spreadsheet = validateAndGetSpreadsheet(SPREADSHEET_URL);
  var sheet = spreadsheet.getSheets()[0];
// -------------------------------------------------------

function removePlacementByDomain (domain,leg) {
  var placementSelector = AdWordsApp.display().placements()
  .withCondition("PlacementUrl CONTAINS '" + domain + "'")
  .withCondition("CampaignStatus != REMOVED")
  .forDateRange(timePeriod)
  .withLimit(100);
  
  
  var placementIterator = placementSelector.get();
  while (placementIterator.hasNext()) {
    var placement = placementIterator.next();
    var placementUrl = placement.getUrl();
    //Logger.log(placementUrl);
    var s = 0-leg
    var p = placementUrl.slice(s);
    if (p == domain){
    var campaign = placement.getCampaign();
	//var adgroup = placement.getAdGroup();
    var excludeOperation = campaign.display().newPlacementBuilder().withUrl(placementUrl).exclude();
	reportRows.push([placement.getCampaign().getName(),placement.getAdGroup().getName(),placementUrl,exflag]);
    Logger.log(" exclude : " + placementUrl)
    if (!excludeOperation.isSuccessful()) {
      Logger.log("Could not exclude : " + placementUrl);
	  exflag = "Could not exclude"
	  reportRows.push([campaign,adgroup,placementUrl,exflag]);
    }
  }
  }

}
function trm(domain){
  return domain.trim();
}

function run () {
  
  Logger.log('Using spreadsheet - %s.', SPREADSHEET_URL);
  spreadsheet.setSpreadsheetTimeZone(AdWordsApp.currentAccount().getTimeZone());
    spreadsheet.getRangeByName('account_id').setValue(
      AdWordsApp.currentAccount().getCustomerId());
  sheet.getRange(1, 2, 1, 1).setValue('Date');
  sheet.getRange(1, 3, 1, 1).setValue(new Date());
  //sheet.getRange(7, 1, sheet.getMaxRows() - 7, sheet.getMaxColumns()).clear();
  Logger.log('Running on .' + AdWordsApp.currentAccount().getCustomerId());
  var lastRow = sheet.getLastRow();

  for (var i = 0; i < TLDs.length; i++){
    var dom = trm(TLDs[i])
    removePlacementByDomain(dom,dom.length)
  }
 
  Logger.log('all:'+reportRows.length)
    if (reportRows.length > 0) {
    sheet.getRange(lastRow+1, 2, 1, 1).setValue(new Date());
  sheet.getRange(lastRow+2, 2, reportRows.length, 4).setValues(reportRows);
  }
  var email = spreadsheet.getRangeByName('email').getValue();
    if (email) {
    var body = [];
    body.push('The Account Placement exclude history :\n');
	body.push('Account ID:' +AdWordsApp.currentAccount().getCustomerId());
    body.push('Full report at ' + SPREADSHEET_URL + '\n\n');
    }
    MailApp.sendEmail(email, '' +
        reportRows.length + ' The  Placement Auto Exclude ' +
        AdWordsApp.currentAccount().getName(), body.join('\n'));
}

function executeInSequence (sequentialIds, executeSequentiallyFunc) {
  Logger.log('Executing in sequence : ' + sequentialIds);
  sequentialIds.forEach(function (accountId) {
    var account = MccApp.accounts().withIds([accountId]).get().next();
    MccApp.select(account);
    executeSequentiallyFunc();
  });
}
/*
function main () {
  try {
    var accountIterator = MccApp.accounts().orderBy('Name').get();
    Logger.log('Total number of accounts under MCC : ' + accountIterator.totalNumEntities());

    var accountIds = [];
    while (accountIterator.hasNext()) {
      var account = accountIterator.next();
      accountIds.push(account.getCustomerId());
    }
    var parallelIds = accountIds.slice(0, 50);
    var sequentialIds = accountIds.slice(50);
    // execute accross accounts
    MccApp.accounts()
      .withIds(parallelIds)
      .executeInParallel('run');
    if (sequentialIds.length > 0) {
      executeInSequence(sequentialIds, run);
    }
  } catch (exception) {
    // not an Mcc
    Logger.log('Running on non-MCC account.');
    run();
  }
}*/



function main(){

      Logger.log('Running on non-MCC account.');
      run();
} 

 function validateAndGetSpreadsheet(spreadsheeturl) {
  if (spreadsheeturl == 'YOUR_SPREADSHEET_URL') {
    throw new Error('Please specify a valid Spreadsheet URL. You can find' +
        ' a link to a template in the associated guide for this script.');
  }
  return SpreadsheetApp.openByUrl(spreadsheeturl);
}
  
