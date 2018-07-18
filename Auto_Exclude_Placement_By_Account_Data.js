


var impressionsMinimum = 1000; // Select Display placements which have at least that number of impressions 
//var maxCtr = 0.001; // Select Display placements which have at least that Click Through Rate percentage 
var conversionsLimit = 0; // Select Display placements which have no more than that number of conversions 
var ViewThroughConversionsLimit = 0; // Select Display placements which have no more than that number of post-impression conversions 
var cost = 50
var timePeriod = "LAST_30_DAYS"; // Period of time to analyze. You can choose another value according to https://developers.google.com/adwords/scripts/docs/reference/adwordsapp/adwordsapp_campaignselector?hl=es-419#forDateRange_1  							  							  
var enablelist = ['anonymous.google']
var reportRows = [];
var exflag = "exclude"
var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1bKZ0aTD9dMYdkvzBclkI5ljXVfoNOe5c4ZbqUZQT18I/edit#gid=0'
  var spreadsheet = validateAndGetSpreadsheet(SPREADSHEET_URL);
  var sheet = spreadsheet.getSheets()[0];
// -------------------------------------------------------


function main(){

      Logger.log('Running on non-MCC account.');
      run();
} 



function exclude () {
  var DisplayPlacements = AdWordsApp.display().placements()
 	//.withCondition("Ctr > "+maxCtr)
    .withCondition("Cost > "+cost)
	.withCondition("Impressions >= "+impressionsMinimum)
    .withCondition("Conversions <= "+conversionsLimit)
	.withCondition("ViewThroughConversions <= "+ViewThroughConversionsLimit)
	.withCondition("CampaignStatus != REMOVED")
	.forDateRange(timePeriod)
    .get();
    
  var placementurl;
  var placement;
  
  while (DisplayPlacements.hasNext()) {
   
    placement = DisplayPlacements.next();

    placementurl = placement.getUrl();
    Logger.log(placementurl);
    
	var campaign = placement.getCampaign();
    var adGroup = placement.getAdGroup();    
    if (enablelist.indexOf(placementurl) == -1){
      var excludeOperation = adGroup.display().newPlacementBuilder().withUrl(placementurl).exclude(); // Exclude Display placement detected
	  	reportRows.push([placement.getCampaign().getName(),placement.getAdGroup().getName(),placementUrl,exflag]);
    Logger.log(" exclude : " + placementUrl)

      if (!excludeOperation.isSuccessful()) {
		Logger.log("Could not exclude : " + placementurl);
		exflag = "Could not exclude"
	  reportRows.push([campaign,adgroup,placementUrl,exflag]);
	  }	 
    } else { 
      Logger.log("Don't exclude Enablelist PlacementUrl !");
	}
  }  
}


function run () {
  
  Logger.log('Using spreadsheet - %s.', SPREADSHEET_URL);
  spreadsheet.setSpreadsheetTimeZone(AdWordsApp.currentAccount().getTimeZone());
    spreadsheet.getRangeByName('account_id').setValue(
      AdWordsApp.currentAccount().getCustomerId());
  sheet.getRange(1, 2, 1, 1).setValue('Date');
  sheet.getRange(1, 3, 1, 1).setValue(new Date());
  sheet.getRange(7, 1, sheet.getMaxRows() - 7, sheet.getMaxColumns()).clear();
  Logger.log('Running on .' + AdWordsApp.currentAccount().getCustomerId());
  
  exclude();

  
  Logger.log('all:'+reportRows.length)
    if (reportRows.length > 0) {
  sheet.getRange(7, 2, reportRows.length, 4).setValues(reportRows);
  }
  var email = spreadsheet.getRangeByName('email').getValue();
    if (email) {
    var body = [];
    body.push('The Account Placement exclude history :\n');
	body.push('Account ID:' +AdWordsApp.currentAccount().getCustomerId());
    body.push('Full report at ' + SPREADSHEET_URL + '\n\n');
    }
    MailApp.sendEmail(email, '' +
        reportRows.length + ' The Auto Placement Exclude ' +
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







 function validateAndGetSpreadsheet(spreadsheeturl) {
  if (spreadsheeturl == 'YOUR_SPREADSHEET_URL') {
    throw new Error('Please specify a valid Spreadsheet URL. You can find' +
        ' a link to a template in the associated guide for this script.');
  }
  return SpreadsheetApp.openByUrl(spreadsheeturl);
}
