//
//
// --- Mobile Applications Project - Fulda University 2016
// 
// 
// --- WEB interface commands set ---
var cmdListCS     = [ 'client_open', 'client_character', 'send_line', 'save_doc', 'convert_doc_pdf', 'getLXdocs',
                     'requre_edit', 'edit_allowed', 'edit_denied', 'news', 'get_file' ,
                     'client_login', 'client_logout'   ] ; 
var cmdListSS     = [ 'server_character', 'propg_line', 'avail_docs', 'alert_doc_edit', 'lastLXedited', 'no_news',
                      'deliver_doc', 'doc_saved', 'doc_converted', 'editing_granted', 'editing_rejected',
                      'login_granted', 'login_rejected', 'logout_confirm' ] ; 

// --- Constants ---         
var sLTXfile       = "lyx" ;         // const 
var sLTXnoData     = "no-data" ;     // const 
var sUserSEPfile   = '@' ;           // const
var sFileNamesSEP  = '#' ;           // const
var sClientDataSEP = '+' ;           // const
var SERVER_URL='http://localhost/api';  //Url constant
var dir="dir";                          //directory of saved latex files
f
fgh

fghddd
// --- Common Variables ---
var onlineUserDetails = {user_ID:0, file_toEdit:"file", activeEntry:false };
var clientsNOW    = [] ;
var clientsIDsNOW = [] ;  
var iSockCounter  = 0;
var sList_all_LTX_files = "" ;
var documentToAllow = { user_ownerID:0, user_requesterID:0, requested_File:"file", editAlowamce:false };

// --- SMO stuff ---
var userOnline =0;                   //number of users online
var roomCounter=0;                   //room counter
var roomList = new Object();         //list of users online
var userOnlineList = new Object();   //list of users online

var colors = require('colors/safe');  
var events = require('events');
var path  = require('path');
var url = require('url');
var express = require ('express');
var fs = require ('fs');
var app = express ();
var server = require ('http').createServer (app);
app.set('views', __dirname + '/views');


//function isThisID_assigned (iSomeID) {  
    var iPosFound = -1;
    var iAlen = clientsIDsNOW.length ;
    if (iAlen < 1) { return -1 ; }
    
    for (i=0; i<iAlen; i++) {
      if ( clientsIDsNOW [i] == iSomeID ) {
         iPosFound = i ;
         break ;
      } // if
    } // for
    
    return iPosFound ;
}

// ---------------------------------------------------------------------
var io = require('socket.io')(server);   

app.use(express.static(__dirname + '/public'));
app.get ('/', function (req, res){
    console.log ('GET /');
    res.sendFile(__dirname +  '/index.html');     
    });

console.log ('server listens on port *3000');
server.listen (3000);

            
io.on('connection', function(socket){
    var sClientID = "" ;
    var sRealData = "" ;
    var curDoc="";
    function extractDATA (clientData) {
            var sToString = clientData.toString () ;
            var posPLUS = clientData.indexOf('+'); 
            var posPLUS1 = clientData.indexOf('#'); 
                    
            if (!(posPLUS < 0)) {
               sClientID = sToString.substring(0, posPLUS); 
			   curDoc = sToString.substring(sToString.indexOf("+") + 1, sToString.indexOf("#"));
               sRealData = sToString.substring(posPLUS1 + 1 ,sToString.length);
			
            } // ifs
		   console.log('Server name   ____ '+ curDoc);
     } // function 
     
     
    function printUsersArray () {
       var iLen = clientsNOW.length;
       for( var i00=0; i00<iLen; i00++ )  {
          onlineUserDetails = clientsNOW[i00] ;
          if (onlineUserDetails.user_ID != -1) {
             console.log( 'member ' + onlineUserDetails.user_ID + ' ' + onlineUserDetails.file_toEdit + ' ' + onlineUserDetails.activeEntry  );
             console.log( '\n' ) ;
          } // if
       } // for
       console.log( 'array-length:' + iLen + '\n' ) ;
    } //  function      
     
     console.log(colors.yellow ('a new visitor was connected via Socket =' + iSockCounter) );
     iSockCounter++ ;
     //   
     // ALL SERVER EMITTED COMMANDS    
     //  '0-propg_char', 
     //  '1-propg_line', 
     //  '2-avail_docs', 
     //  '3-alert_doc_edit', 
     //  '4-lastLXedited', 
     //  '5-no_news',
     //  '6-deliver_doc', 
     //  '7-doc_saved', 
     //  '8-doc_converted' 
     //  
     // --- command # client_open >>>  ---
     socket.on('client_open', function(msg){
       extractDATA (msg) ;
       console.log('client-ID ' + sClientID + ' sent the command >>> client_open: ' + sRealData );
         
        var iUserIndex = isThisID_assigned (sClientID) ;
        var sCurrentUserFile = "" ;
        if (iUserIndex !== -1) {
            // --- DO NOT remove from the 1st list >>> clientsIDsNOW ---
            // --- DETACH THE FILE ONLY from from the 2nd list ---
            onlineUserDetails = clientsNOW [iUserIndex] ;
            sCurrentUserFile  = onlineUserDetails.file_toEdit ;
            onlineUserDetails.file_toEdit = "";
            clientsNOW [iUserIndex] = onlineUserDetails ;
        } // if
       console.log('client ' + sClientID + ' detached from file ' + sCurrentUserFile );
     });

     // --- command # send_char >>> propg_char ---
     socket.on('client_character', function(msg){
       extractDATA (msg) ;
       console.log('client-ID ' + sClientID + ' sent the command >>> send_char: ' + sRealData );
       
       var sToEmit = sClientID + '+' + curDoc+ '#' + sRealData ;
       io.emit( 'server_character', sToEmit );    
       console.log( colors.green ('server emits ' +  sToEmit + '\n') );
     });

     // --- command # send_line >>> propg_line ---  
     socket.on('send_line', function(msg){
       extractDATA (msg) ;
       console.log('client-ID ' + sClientID + ' sent the command >>> send_line: ' + sRealData );
       var sToEmit = sClientID + '+' + curDoc+ '#' + sRealData ;
       io.emit( 'propg_line', sToEmit );    
       console.log( colors.green ('server emits ' +  sToEmit + '\n') );
     });
     
     // --- command # get_file >>> deliver_doc ---
     socket.on('get_file', function(LTX_fn){
       extractDATA (LTX_fn) ;
       console.log('client-ID ' + sClientID + ' sent the command >>> get_file: ' + sRealData );
       curDoc=sRealData;
       if (sRealData.includes("." + sLTXfile) ) { /*  do nothing the file name is complete */ } 
       else                                     { sRealData += "." + sLTXfile ;               } 
       
       console.log( colors.yellow ('\n' + 'array before ' + '\n' ) ) ;
       printUsersArray () ;
       // --- check if the reqired file is already processed ---
       var iLen33       = clientsNOW.length;
       var bFound33     = false ;
       var iShareID33   = -1 ;
       for( var i33=0; i33<iLen33; i33++) {
           console.log('index =' +  i33 + '\n' );
           onlineUserDetails = clientsNOW[i33] ;
           if (onlineUserDetails.file_toEdit != sRealData )     
              continue ;
           // ---------------------------------------------------
           bFound33   = true ;
           iShareID33 = onlineUserDetails.user_ID ;        
           break ;
       } // for
       console.log('last index =' +  i33 + '  Found =' + bFound33 + '\n' );
       if (!bFound33) { 
          // --- make a mapping: client-ID ---> file-name ---
          if (typeof (sClientID) == "string" ) { onlineUserDetails.user_ID = parseInt (sClientID) ; }
          else                                 { onlineUserDetails.user_ID = sClientID ;            }
          onlineUserDetails.file_toEdit = sRealData ;
          onlineUserDetails.activeEntry = true ;
          clientsNOW.push (onlineUserDetails) ;
          
          var sToEmit = sClientID + '+'  + '#' + fs.readFileSync(  __dirname+'\\'+sRealData , 'utf8');
          socket.emit('deliver_doc', sToEmit );
          console.log(colors.green ( 'server emits ' +  sToEmit + '\n') );
       } // if
       else {
          // --- syntax: to user-ID to allow + file-name to be edited + user-ID inquirer + dummy data            
          var sShareFile33 = iShareID33.toString() + '+' + sRealData + '+' + sClientID + '+' + 'alert_doc_edit' ;
          var iRequesterUserID = 0 ;
          if (typeof (sClientID) == "string" ) { iRequesterUserID = parseInt (sClientID) ; }
          else                                 { iRequesterUserID = sClientID ;            }
        //io.emit('alert_doc_edit', sShareFile33);   // broadcast to everybody 
          // sending to all clients except sender
          socket.broadcast.emit('alert_doc_edit', sShareFile33 );
          
          documentToAllow.user_ownerID     = sShareFile33 ;
          documentToAllow.user_requesterID = iRequesterUserID ;
          documentToAllow.requested_File   = sRealData ;
          documentToAllow.editAlowamce     = false ;
          console.log(colors.green ( 'server emits ' +  sShareFile33 + '  documentOBJ: ' + documentToAllow + '\n') );
       } // else 
       console.log( colors.yellow ('\n' + 'array after ' + '\n' ) );
       printUsersArray () ;
     });

     // --- command # save_doc >>> doc_saved ---
     socket.on('save_doc', function(LTX_filename){
       extractDATA (LTX_filename) ;
       console.log('client-ID ' + sClientID + ' sent the command >>> save_doc: ' + sRealData + '\n');
       var bErrSave = false ;
       var sToEmit = sClientID + '+' ;
       
       // --- file name is after the second +
       extractDATA (sRealData) ;
       console.log('LTX filename ' + sClientID + ' data to save >>> ' + sRealData + '\n');
       LTX_filename = sClientID ;
       if (LTX_filename.includes("." + sLTXfile) ) { /*  do nothing the file name is complete */ } 
       else                                        { LTX_filename += "." + sLTXfile ;             } 
       
       fs.appendFileSync( LTX_filename, sRealData, 'utf8', function(err) {      //__dirname+'/'+
          if (err)  { sToEmit += 'error at doc-save' ;      bErrSave=true; }
          else      { sToEmit += 'success: document saved'; bErrSave=false; }  
       });
       
       socket.emit( 'doc_saved', sToEmit );  
       if (bErrSave) { console.log( colors.red   ('server emits: doc_saved & failure \n') ); }
       else          { console.log( colors.green ('server emits: doc_saved & success \n') ); }
     });

     // --- command # getLXdocs >>> avail_docs ---
     socket.on('getLXdocs', function(msg){
       extractDATA (msg) ;
       console.log('client-ID ' + sClientID + ' sent the command >>> getLXdocs: ' + sRealData );
       
       var bFoundLYXfile   = false;
       sList_all_LTX_files = sClientID + '+' ;
       var files = fs.readdirSync( __dirname );
       for( var i in files) {
           var sTMP = "" ;
           if (files[i].includes("." + sLTXfile) ) {   
               bFoundLYXfile = true ;
               sTMP = files [i].replace( "." + sLTXfile, "");
               sList_all_LTX_files += sTMP + "#" ;                             // # - separator between multiple data
           } // if    
       } // for
       if (!bFoundLYXfile) { sList_all_LTX_files += 'no-data' + "#"; }         // # - separator between multiple data

       socket.emit( 'avail_docs', sList_all_LTX_files );    
       console.log(colors.green ('\n') );
       console.log(colors.green ('server emits ' +  sList_all_LTX_files + '\n') );
      });

     // --- command # requre_edit >>> ---
     socket.on('requre_edit', function(msg){
       console.log('requre_edit: ' + msg);
     });

     // --- command # edit_allowed >>> ---
     socket.on('edit_allowed', function(msg){
       extractDATA (msg) ;
       console.log('client-ID ' + sClientID + ' sent the command >>> edit_allowed: ' + sRealData );
       var sToEmit = documentToAllow.user_requesterID + '+' + 
                     fs.readFileSync(  __dirname+'\\'+documentToAllow.requested_File , 'utf8');

       socket.broadcast.emit('editing_granted', sToEmit );
       
       documentToAllow.user_ownerID = 0 ;
       documentToAllow.user_requesterID = 0 ;
       documentToAllow.requested_File = "" ;
       documentToAllow.editAlowamce = false ;

       console.log(colors.green ('server emits ' +  sToEmit + '\n') );
     });

     // --- command # edit_denied >>> ---
     socket.on('edit_denied', function(msg){
       console.log('edit_denied: ' + msg);
     });

     // --- command # news >>> no_news ---
     socket.on('news', function(msg){
       extractDATA (msg) ;
       console.log('client-ID ' + sClientID + ' sent the command >>> news: ' + sRealData );
       var sToEmit = sClientID + '+' + 'no_news' ;
       io.emit( 'no_news', sToEmit );    
       console.log(colors.green ('server emits ' +  sToEmit + '\n') );
     });
     
     // --- command # convert_doc_pdf >>> doc_converted ---
     socket.on('convert_doc_pdf', function(msg){
       extractDATA (msg) ;
       console.log('client-ID ' + sClientID + ' sent the command >>> convert_doc_pdf: ' + sRealData );
       // === new stuff ===
       sRealData = "" ;
       msg       =  "sami@my-LaTeX-doc1" + "." + sLTXfile ;
       var bSuccessPDF   = false ;
       var bTryToConvert = false ;
       var fid = msg ;                         // --- File name ---
       var latexFile= dir + '\\' + msg;        // --- latex-file path: CONSTANT ---
       
       if (fid.includes("." + sLTXfile) ) { /*  file name is complete */ } 
       else                               { fid += "." + sLTXfile ;      } 

       var fileContent = fs.readFileSync(  __dirname+'\\'+fid , 'utf8');        //load file contents
       if (bTryToConvert) {
          request({
            url:     __dirname + '\\' + 'api' + '\\' + 'latex2pdf.php',  
            method:  'POST', 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            //Lets post the following key/values as form
            form: { file_content: fileContent,  file_id: fid } }, 
            function(error, response, body){
              if (error) { bSuccessPDF=false; console.log("Some Xerror: "+error ); } 
              else       
              { 
                 console.log(response.statusCode, body );
                 //Extraction of the converted PDF name from the result
                 var pdfName = body.replace(/^"(.*)"$/, '$1');
                 //Build a full URL of the converted PDF document
                 var link_pdf=SERVER_URL+"/pdf/"+pdfName;
                 //Preparing a Json object to be sent to clients
                 var document = { name: fid, url: link_pdf, creator: sClientID };
           } // else
         });
       } // if
       // === new stuff end ===
       
       var sToEmit = sClientID  ;  
       if (bSuccessPDF) { sToEmit += '+' + fid + ' to PDF document converted' ; }
       else             { sToEmit += '+' + fid + ' conversion to PDF failed'  ;  }
       socket.emit( 'doc_converted', sToEmit );    
       console.log( colors.green ('server emits ' +  sToEmit + '\n') ) ;
     });

     
     ////////////////////////////////////////////////////////////////
     // --- SMO ---
     ////////////////////////////////////////////////////////////////
    //Error detection and logging
    socket.on('error', function(err) {
        console.log('Error!', err);
    });

    //Subscription to a room/group  [subscribe >>> server_roomlist]
    socket.on('subscribe', function(room) { 
        console.log('joining room ', room);
        
        socket.join(room);                       //Joining the room
        roomCounter++;                           //Increase room counter
        roomList[room]=room;                     //Add room in the list
        io.emit('server_roomlist',roomList);     //Emitting room list to client
    }) ;
    
    //Unsubscribe from a room/group  [unsubscribe >>> server_roomlist]
    socket.on('unsubscribe', function(room) {  
        console.log('leaving room ', room);
        
        socket.leave(room);                      //Leaving the room
        roomCounter--;                           //Decrease counter
        delete roomList[room];                   //Remove from room list
        io.emit('server_roomlist',roomList);     //Emitting room list to client
    }) ;
    
    //Increment the number of user online
    userOnline++;
    
    //Emitting the number of online users
    io.emit('user_online',userOnline);
    
    //Disconnecting 
    socket.on('disconnect', function(){
        console.log('Disconnected from a client');
        
        userOnline--;                         //Decrement the number of user online
        io.emit('user_online',userOnline);    //Emitting the number of online users
    });
    
    //Server receives new login credentials (userEmail, userPassword) from a client 
    socket.on('client_login',function(msg, room){
        //receive data and room (legacy and compatibility)
        console.log('User email: '+msg.userEmail + "User password: "+msg.userPassword);
        // --- HERE should be checked with the database ---
        var checkedID    = 0;
        var iStopLoop100 = 0;
        do {
           checkedID = Math.floor ((Math.random () * 10000) + 1) ;
           console.log('generated new ID: ' + checkedID + '\n' );
           iStopLoop100++ ; 
        } while ( (isThisID_assigned (checkedID) !== -1) && (iStopLoop100 < 100) ) ;
        // --- entry in the 1st list ---
        clientsIDsNOW.push (checkedID) ;
        // --- construct object ---
        onlineUserDetails.user_ID = checkedID ;
        onlineUserDetails.file_toEdit = "" ;
        onlineUserDetails.activeEntry = true ;
        // --- entry in the 2nd list ---
        clientsNOW.push (onlineUserDetails) ;
        // --- emit a new userID that is logged-in ---
        var sToEmit = checkedID.toString () + '+' + 'login granted' + '+' + msg.userEmail + '+' + msg.userPassword ;
        socket.emit('login_granted', sToEmit );
        printUsersArray () ;
        console.log(colors.green ( 'server emits ' +  sToEmit + '\n') );
    });
    
    //Loging out
    socket.on('client_logout',function(msg){
        //receive data and room (legacy and compatibility)
        extractDATA (msg) ;
        console.log('client-ID ' + sClientID + ' sent the command >>> client_logout: ' + sRealData );
          
        userOnline--;  //Decrement the number of user online
        var iUserIndex = isThisID_assigned (sClientID) ;
        if (iUserIndex !== -1) {
            // --- remove from the 1st list ---
            clientsIDsNOW [iUserIndex] = -1 ; 
            // --- remove from the 2nd list ---
            onlineUserDetails = clientsNOW [iUserIndex] ;
            onlineUserDetails.user_ID = -1;
            onlineUserDetails.file_toEdit = "";
            onlineUserDetails.activeEntry = false ;
            clientsNOW [iUserIndex] = onlineUserDetails ;
        } // if
        var sToEmit = sClientID + '+' + 'logout_confirm' ;
        socket.emit('logout_confirm', sToEmit );
        io.emit('user_online', userOnline);             
        console.log(colors.green ( 'server emits '     +  sToEmit + '\n') );
        console.log(colors.green ( 'server broadcast ' +  sToEmit + '\n') );
    });


    //Server sends content of the requested document to the client (MODIFIED)
    socket.on('client_getDocContent',function(path){
        //receive data and room
        console.log('Requested content path: '+path);
         
        //Reading a file and emitting it to the client
        var fileData = fs.readFileSync( __dirname, 'utf8');
        socket.emit('server_getDocContent', fileData );
    });

});

