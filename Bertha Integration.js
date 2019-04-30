
//Run every minute to send an email to Bertha system, which'll process it to log new row
function updateBertha(){
  var recipient = berthaEmail()
  var subject = "Auto-Log API: Log Donation"
  var message = ""
  var email_num_limit = 20; //because there should be no instance of more than 20 emails at once (catches a weird bug still tbd from 9/28 where it created a new column)  
  var num_emails = 0;
  
  var sheet = SpreadsheetApp.openById(serverID()).getSheetByName('Form Entries')
  var data = sheet.getDataRange().getValues()

  var indexFlag = 0
  var indexEmail = 1
  var indexName = 2
  var indexFacility = 3
  var indexSupplies = 4
  var indexBerthaSent = 7
  
  var timestamp = Utilities.formatDate(new Date(), "GMT-04:00", "MM/dd/yyyy HH:mm:ss")
  
  for(var i = 0; i < data.length; i++){
    if(data[i][indexBerthaSent].toString().trim().length == 0){ //only look at new rows 
        if(data[i][2].toString().trim().length > 0){ //only look at submitted rows

          if(data[i][indexFlag].toString().trim() == "FACILITY NOT FOUND"){
            message = "Facility: PHARMACY FORM ENTERED: " + data[i][indexFacility] + "\nNumber Of Boxes: 1\n"
            message += "Contact: " + data[i][indexName].toString() + " ----- " + data[i][indexEmail] + "\n"

          } else {
            message = "Facility: " + data[i][indexFacility] + "\nNumber Of Boxes: 1\n"
            message += "Contact: " + data[i][indexName].toString() + "\n"
          }
          
          message += "Supplies: " + data[i][indexSupplies].toString() + "\nEND"
    
          
          MailApp.sendEmail(recipient,subject,message) //TODO switch to use 'recipient'
          sheet.getRange((i+1),(indexBerthaSent+1)).setValue(timestamp)
        }
    }
  }
}
