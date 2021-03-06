/*
Copyright (C) 2014-2018  Barry de Graaff

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
 */
ZaShareToolkitTab = function(parent, entry) {
    if (arguments.length == 0) return;
    ZaTabView.call(this, parent,"ZaShareToolkitTab");
    ZaTabView.call(this, {
        parent:parent,
        iKeyName:"ZaShareToolkitTab",
        contextId:"SHARE_TOOLKIT"
    });
    this.setScrollStyle(Dwt.SCROLL);

    var soapDoc = AjxSoapDoc.create("ShareToolkit", "urn:ShareToolkit", null);
    soapDoc.getMethod().setAttribute("action", "getAccounts");
    var csfeParams = new Object();
    csfeParams.soapDoc = soapDoc;
    csfeParams.asyncMode = true;
    csfeParams.callback = new AjxCallback(ZaShareToolkitTab.prototype.getAccountsCallback);
    var reqMgrParams = {} ;
    resp = ZaRequestMgr.invoke(csfeParams, reqMgrParams);

    document.getElementById('ztab__SHARE_TOOLKIT').innerHTML = '<div style="padding-left:10px"><h1>Share Toolkit</h1>' +
    '<h2>Create and remove shares</h2>This option allows you to share an entire account with another account. Useful for department and team mailboxes.<br><br><select id="ShareToolkit-action" onchange="ZaShareToolkitTab.prototype.uiUpdate(this.value);" ><option value="createShare">Share</option><option value="removeShare">Unshare</option></select> the account <input type="text" id="ShareToolkit-account-a" list="ShareToolkit-datalist" placeholder="user@domain.com">&nbsp;<span id="ShareToolkit-withfrom">with</span>:&nbsp;<input type="text" id="ShareToolkit-account-b" list="ShareToolkit-datalist" placeholder="other-user@domain.com"><datalist id="ShareToolkit-datalist"></datalist>&nbsp;&nbsp;<button id="ShareToolkit-btnCreateShare">OK</button>' +
    '<br><br><input type="checkbox" id="ShareToolkit-disablePersonaCreation">Share only (skip configuring sendAs/persona\'s and mail filter).' +
    '<br><br><b>Permissions:</b>' +
    '<br><select onchange="ZaShareToolkitTab.prototype.uiUpdate(this.value);" id="ShareToolkit-permissions">'+
    '<option value="r">r</option>' +
    '<option value="rw">rw</option>' +
    '<option value="rwix">rwix</option>' +
    '<option selected="selected" value="rwixd">rwixd</option>' +
    '<option value="rwixda">rwixda</option>' +
    '<option value="none">none</option></select>' +    
    '<small style="font-size:11px;"><ul><li> (r)ead - search, view overviews and items</li><li> (w)rite - edit drafts/contacts/notes, set flags </li><li> (i)nsert - copy/add to directory, create subfolders action</li><li> (x) - workflow actions, like accepting appointments</li><li> (d)elete - delete items and subfolders, set \Deleted flag</li><li> (a)dminister - delegate admin and change permissions</li></ul></small>' +
    '<br><hr>' +
    '<h2>Generate persona\'s</h2>This option allows you to generate a persona for each alias in the users account. <br><br><input type="text" id="ShareToolkit-account-c" list="ShareToolkit-datalist" placeholder="user@domain.com">&nbsp;&nbsp;<button id="ShareToolkit-btnPersonaGen">OK</button>' +
    '<br><br><hr>' +
    '<h2>Status</h2><div id="ShareToolkit-status" style="color:#aaaaaa; font-style: italic;"></div>' +
    '<br><br><hr>' +
    '<h2>Shared</h2><span id="status_shared" style="color:#aaaaaa; font-style: italic;"></span><br><button id="ShareToolkit-btnGetShareds">Get Shareds</button><div id="shared" style="color:#aaaaaa; font-style: italic;"></div>' +
    '</div>';   
    
    ZaShareToolkitTab.prototype.status('Loading auto completion...');

    ZaShareToolkitTab.prototype.getShareds();
   
    var btnGetShareds = document.getElementById('ShareToolkit-btnGetShareds');
    btnGetShareds.onclick = AjxCallback.simpleClosure(this.getShareds);
 
    var btnCreateShare = document.getElementById('ShareToolkit-btnCreateShare');
    btnCreateShare.onclick = AjxCallback.simpleClosure(this.btnCreateRemoveShare);
    
    var btnPersonaGen = document.getElementById('ShareToolkit-btnPersonaGen');
    btnPersonaGen.onclick = AjxCallback.simpleClosure(this.btnPersonaGen);
}


ZaShareToolkitTab.prototype = new ZaTabView();
ZaShareToolkitTab.prototype.constructor = ZaShareToolkitTab;

ZaShareToolkitTab.prototype.getTabIcon =
    function () {
        return "ClientUpload" ;
    }

ZaShareToolkitTab.prototype.getTabTitle =
    function () {
        return "Share Toolkit";
    }

ZaShareToolkitTab.prototype.getAccountsCallback = function (result) {
   var dataList = document.getElementById('ShareToolkit-datalist');
   var users = result._data.Body.ShareToolkitResponse.shareToolkitResult._content.split(";");
   
   users.sort();
   users.forEach(function(item) 
   {
      // Create a new <option> element.
      var option = document.createElement('option');
      // Set the value using the item in the JSON array.
      option.value = item;
      // Add the <option> element to the <datalist>.
      dataList.appendChild(option);
   });
   ZaShareToolkitTab.prototype.status('Ready.');
   return;
}

ZaShareToolkitTab.prototype.btnCreateRemoveShare = function () {
    if(document.getElementById('ShareToolkit-action').value == 'createShare')
    {
       ZaShareToolkitTab.prototype.status('Creating share...');
    }
    else
    {
       ZaShareToolkitTab.prototype.status('Removing share...');
    }   
    var accountA = document.getElementById('ShareToolkit-account-a').value;
    var accountB = document.getElementById('ShareToolkit-account-b').value;
    var skipPersonaCreation = document.getElementById('ShareToolkit-disablePersonaCreation').checked;
    var permissions = document.getElementById('ShareToolkit-permissions').value;
    
    if(accountA && accountB && (accountA !== accountB))
    {
       var soapDoc = AjxSoapDoc.create("ShareToolkit", "urn:ShareToolkit", null);
       soapDoc.getMethod().setAttribute("action", document.getElementById('ShareToolkit-action').value);
       soapDoc.getMethod().setAttribute("accounta", accountA);
       soapDoc.getMethod().setAttribute("accountb", accountB);
       soapDoc.getMethod().setAttribute("skipPersonaCreation", skipPersonaCreation);
       soapDoc.getMethod().setAttribute("permissions", permissions);
       var csfeParams = new Object();
       csfeParams.soapDoc = soapDoc;
       csfeParams.asyncMode = true;
       csfeParams.callback = new AjxCallback(ZaShareToolkitTab.prototype.shareToolkitDefaultCallback);
       var reqMgrParams = {} ;
       resp = ZaRequestMgr.invoke(csfeParams, reqMgrParams);
    }   
    else
    {
       ZaShareToolkitTab.prototype.status('Select or type 2 different email addresses.');
    }
}   

ZaShareToolkitTab.prototype.btnPersonaGen = function () {
    ZaShareToolkitTab.prototype.status('Creating persona\'s...');

    var accountA = document.getElementById('ShareToolkit-account-c').value;
  
    if(accountA)
    {
       var soapDoc = AjxSoapDoc.create("ShareToolkit", "urn:ShareToolkit", null);
       soapDoc.getMethod().setAttribute("action", "createPersonas");
       soapDoc.getMethod().setAttribute("accounta", accountA);
       var csfeParams = new Object();
       csfeParams.soapDoc = soapDoc;
       csfeParams.asyncMode = true;
       csfeParams.callback = new AjxCallback(ZaShareToolkitTab.prototype.shareToolkitDefaultCallback);
       var reqMgrParams = {} ;
       resp = ZaRequestMgr.invoke(csfeParams, reqMgrParams);
    }   
    else
    {
       ZaShareToolkitTab.prototype.status('Select or type email address.');
    }
} 

ZaShareToolkitTab.prototype.removeShare = function (accountA, accountB, permissions) {
   ZaShareToolkitTab.prototype.status('Removing share...');

   var skipPersonaCreation = document.getElementById('ShareToolkit-disablePersonaCreation').checked;
   if (accountA && accountB && (accountA !== accountB)) {
      var soapDoc = AjxSoapDoc.create("ShareToolkit", "urn:ShareToolkit", null);
      soapDoc.getMethod().setAttribute("action", "removeShare");
      soapDoc.getMethod().setAttribute("accounta", accountA);
      soapDoc.getMethod().setAttribute("accountb", accountB);
      soapDoc.getMethod().setAttribute("skipPersonaCreation", skipPersonaCreation);
      soapDoc.getMethod().setAttribute("permissions", permissions);
      var csfeParams = new Object();
      csfeParams.soapDoc = soapDoc;
      csfeParams.asyncMode = true;
      csfeParams.callback = new AjxCallback(ZaShareToolkitTab.prototype.shareToolkitDefaultCallback);
      var reqMgrParams = {};
      resp = ZaRequestMgr.invoke(csfeParams, reqMgrParams);
   }
   else {
      ZaShareToolkitTab.prototype.status('Select or type 2 different email addresses.');
   }
}

ZaShareToolkitTab.prototype.getSharedsCallback = function (result) {
   var shareds = result._data.Body.ShareToolkitResponse.shareToolkitResult._content.split(";");
   var txtShareds = shareds[0].split("#").join("")
   var jshareds = JSON.parse(txtShareds);
   var outPut = "<div style='margin-top:15px'>"
   var index = 0;
   jshareds.forEach(function(principal){
      outPut = outPut + "<div style='display: flex; width: 500px; justify-content: space-between; margin-bottom: 15px;'><div>" + principal.email + "</div>";
      outPut = outPut + "<div>";
      principal.shared.forEach(function (secundario){
         outPut = outPut + "<div style='display: flex; width: 270px; justify-content: space-between;'>" + secundario.email + "<button id='del-" + index + "' style='margin-left: 5px;'>Del</button></div>";
         index = index + 1;
      })
      outPut = outPut + "</div></div><hr style='width:100%'></hr>";
   })
   outPut = outPut + "</div>";
   document.getElementById('shared').innerHTML = outPut;
   index = 0;
   btnDel = [];
   jshareds.forEach(function(principal){
      principal.shared.forEach(function (secundario){
         btnDel[index] = document.getElementById('del-' + index);
         btnDel[index].addEventListener('click', function() { AjxCallback.simpleClosure(ZaShareToolkitTab.prototype.removeShare(principal.email, secundario.email, secundario.permissao)); } );
         index = index + 1;
      })
   })

   document.getElementById('status_shared').innerHTML = "Ready.";
   return;
}

ZaShareToolkitTab.prototype.getShareds = function () {
   document.getElementById('status_shared').innerHTML = "Getting shareds... ";
   var soapDoc = AjxSoapDoc.create("ShareToolkit", "urn:ShareToolkit", null);
   soapDoc.getMethod().setAttribute("action", "getShareds");
   var csfeParams = new Object();
   csfeParams.soapDoc = soapDoc;
   csfeParams.asyncMode = true;
   csfeParams.callback = new AjxCallback(ZaShareToolkitTab.prototype.getSharedsCallback);
   var reqMgrParams = {};
   resp = ZaRequestMgr.invoke(csfeParams, reqMgrParams);
}
  
ZaShareToolkitTab.prototype.shareToolkitDefaultCallback = function (result) {
   ZaShareToolkitTab.prototype.status('Ready. '+result._data.Body.ShareToolkitResponse.shareToolkitResult._content);
   ZaShareToolkitTab.prototype.getShareds();
}  

ZaShareToolkitTab.prototype.status = function (statusText) {
   document.getElementById('ShareToolkit-status').innerHTML = statusText;
}

ZaShareToolkitTab.prototype.uiUpdate = function (value) {
   if(value == 'createShare')
   {
      document.getElementById('ShareToolkit-withfrom').innerHTML = 'with';
      document.getElementById('ShareToolkit-permissions').value = 'rwixd';
      document.getElementById('ShareToolkit-permissions').disabled = false;
   }
   else if(value == 'none')
   {
      document.getElementById('ShareToolkit-withfrom').innerHTML = 'from';
      document.getElementById('ShareToolkit-permissions').value = 'none';
      document.getElementById('ShareToolkit-permissions').disabled = true;
      document.getElementById('ShareToolkit-action').value = 'removeShare';
   }
   else if(value == 'removeShare')
   {
      document.getElementById('ShareToolkit-withfrom').innerHTML = 'from';
      document.getElementById('ShareToolkit-permissions').value = 'none';
      document.getElementById('ShareToolkit-permissions').disabled = true;
   }
}
