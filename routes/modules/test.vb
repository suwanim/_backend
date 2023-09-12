Public Revision As String


Function PreSave()
   ' Warning messages for delete
   Dim i As Integer
   Dim j As Integer
    
   On Error GoTo ErrorHandler
          
   For i = 0 To ThisForm.PrimaryCache.GetNumEntries - 1
      If ThisForm.PrimaryCache.IsObjectNew(i) Or _
         ThisForm.PrimaryCache.IsObjectModified(i) Then
         For j = 0 To ThisForm.PrimaryCache.GetNumEntries - 2
            ThisForm.PrimaryCache.SetObjectPropertyPlusModifyRefresh "UBTableName", j, _
               ThisForm.ParentForm.Variables("vTableForNotes")
            ThisForm.PrimaryCache.SetObjectPropertyPlusModifyRefresh "UBRefRowPointer", j, _
               ThisForm.Variables("vRefRowPointer")
            If ThisForm.PrimaryCache.IsObjectNew(i) Then
               Dim vNoteType As Variant
               If ThisForm.PrimaryCache.GetObjectProperty("SystemNoteToken", j) <> "" Then
                  vNoteType = "System"
               ElseIf ThisForm.PrimaryCache.GetObjectProperty("UserNoteToken", j) <> "" Then
                  vNoteType = "User"
               Else
                  vNoteType = "Specific"
               End If
               ThisForm.PrimaryCache.SetObjectPropertyPlusModifyRefresh ("DerType"), j, vNoteType
            End If
         Next
         Exit For
      End If
   Next
   
   Exit Function
ErrorHandler:
    Application.ShowMessage ("PreSave: Error")
    PreSave = -1
End Function
Sub EnableDisable()
   Dim iSPos As Integer
   Dim iEPos As Integer
   Dim Quotes As Variant
   
   Quotes = """"
   If ThisForm.ParentFormName = "EngineeringChangeNoticeItems" Then
      If ThisForm.ParentForm.Variables("vTableForNotes") = "ecnbomnotes" Then
         ThisForm.CurrentCache.DeleteEnabled = _
             ThisForm.PrimaryCache.GetCurrentObjectProperty("DerOrigin") <> "Original"
      End If
   End If
         
   ThisForm.Components("DerContentEdit").Enabled = _
      ThisForm.PrimaryCache.IsCurrentObjectNew = True Or _
      (InStr(ThisForm.PrimaryCache.GetCurrentObjectProperty("DerContent"), "ATTACHMENT") = 0) And _
      ThisForm.PrimaryCache.GetCurrentObjectProperty("DerType") = "Specific"
   ThisForm.Components("DerContentGridCol").Enabled = ThisForm.Components("DerContentEdit").Enabled
      
   ThisForm.Components("DerDescEdit").Enabled = _
      ThisForm.PrimaryCache.IsCurrentObjectNew = True Or _
      ThisForm.PrimaryCache.GetCurrentObjectProperty("DerType") = "Specific"
   ThisForm.Components("DerDescGridCol").Enabled = ThisForm.Components("DerDescEdit").Enabled
      
   ThisForm.Components("AttachFileButton").Enabled = ThisForm.Components("DerContentEdit").Enabled
   
   ThisForm.Components("OpenAttachmentButton").Enabled = _
     InStr(ThisForm.PrimaryCache.GetCurrentObjectProperty("DerContent"), "ATTACHMENT") > 0

   If InStr(ThisForm.PrimaryCache.GetCurrentObjectProperty("DerContent"), "ATTACHMENT") > 0 Then
      iSPos = InStr(ThisForm.PrimaryCache.GetCurrentObjectProperty("DerContent"), "<") + 1
      iEPos = InStr(ThisForm.PrimaryCache.GetCurrentObjectProperty("DerContent"), ">") - 1
      ThisForm.Variables("vAttachment").Value = Quotes & Mid(ThisForm.PrimaryCache.GetCurrentObjectProperty("DerContent"), iSPos, iEPos - iSPos + 1) & Quotes
   End If
End Sub
Sub OpenGetFile()
   
    On Error GoTo OpenGetFileErr
    GetFile.filter = "All iles (*.*)|*.*"
    GetFile.Flags = cdlOFNHideReadOnly
    GetFile.DialogTitle = Application.GetStringValue("sA&ttach File...")
    GetFile.ShowOpen
    GetFile.CancelError = False
    If GetFile.Filename <> "" Then
  '     ThisForm.PrimaryCache.SetCurrentObjectPropertyPlusModifyRefresh ("DerContent"), _
  '       "ATTACHMENT: <" & GetFile.Filename & ">"
         ThisForm.Components("DerDescEdit").Text = GetFile.Filename
 '      ThisForm.Components("DerContentEdit").Enabled = False
 '      ThisForm.Components("AttachFileButton").Enabled = False
    End If
    
    Exit Sub
     
OpenGetFileErr:
    If Err.Number <> cdlCancel Then
        Application.ShowMessage Err.Description
    End If
End Sub

Sub SetNotesProperty()
   Dim i As Integer
   Dim oCache As Object

    If ThisForm.Variables("vCancelClicked") <> "" Then Exit Sub
    
   Set oCache = ThisForm.PrimaryCache

   If ThisForm.ParentFormName = "EngineeringChangeNoticeItems" Then
      ThisForm.ParentForm.PrimaryCache.SetCurrentObjectPropertyPlusModifyRefresh ("DerNotesFlag"), 0
      For i = 0 To oCache.GetNumEntries - 1
         If ((Not oCache.IsObjectTheAutoInsertRow(i)) And (Not oCache.IsObjectNew(i))) Then
            ThisForm.ParentForm.PrimaryCache.SetCurrentObjectPropertyPlusModifyRefresh ("DerNotesFlag"), 1
            Exit For
         End If
      Next
   Else
      If ThisForm.ParentFormName <> "" Then
         For i = 0 To oCache.GetNumEntries - 1
            'If (oCache.GetNumEntries = 2) And oCache.IsObjectNew(i) Then
            If ((Not oCache.IsObjectTheAutoInsertRow(i)) And (Not oCache.IsObjectNew(i))) Then
               ThisForm.ParentForm.PrimaryCache.SetCurrentObjectProperty ("NoteExistsFlag"), 0
            Else
               ThisForm.ParentForm.PrimaryCache.SetCurrentObjectProperty ("NoteExistsFlag"), 1
            End If
         Next
         ThisForm.ParentForm.GenerateEvent ("StdFormCurrentNotesCompleted")
      End If
   End If
End Sub

Sub CheckLaunchedFromParent()
    If ThisForm.ParentForm Is Nothing Then
        ThisForm.CallGlobalScript "MsgApp", "Clear", "NoPrompt", "PromptResponse", "mE=ParentLaunchOnly", _
                                  ThisForm.Name, _
                                  "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
        Application.ShowMessage ThisForm.Variables("PromptMsg"), vbExclamation
    End If
End Sub
Sub PreviewTHM()


  Dim TextLine$, Filename$
  Dim FileHandle As Integer
  Dim iRow, iCol As Integer

  Dim oGrid As Object
  Dim iCurrentRow As Integer
  Dim iCurrentColumn As Integer
  Dim iRowCount As Integer
  
  Dim ExcelWorksheet As Object
  Dim Fcst_qty As Double
  Dim mth As Integer
  Dim yr As Integer
  Dim Item As String
  Dim cont_price As Double
  Dim cust_seq As Integer
  Dim Connection As IIDOConnection
  Dim Command As IIDOCommand
  Dim RecSet As IIDORecordset
  Dim myLine As String
  Dim myLineLen As Integer
  Dim startline As Boolean
  Dim xcqfile As Boolean
  Dim clCustomer, clCusitem, clY, clM, clTotal, clFc35, clFc15, clNstitem As Integer
  Dim grid As Object
  Dim gridcount, curRow As Integer
  Dim clTemp As String
  Dim cust_num As String
  
  i = 1
  Filename$ = Trim(ThisForm.Components("DerDescEdit").Text)
  
  If Dir(Filename$) = "" Then Exit Sub
  
  FileHandle = FreeFile ' This is safer than assigning a number
 
   
    Set grid = ThisForm.Components("SalesGrid")
    gridcount = grid.GetGridRowCount
   
   For i = 1 To 6
        clTemp = grid.GetGridValue(0, i)
        If clTemp = "Year" Then clY = i
        If clTemp = "Month" Then clM = i
        If clTemp = "Item" Then clitem = i
        If clTemp = "Cust Item" Then clCusitem = i
        If clTemp = "Qty" Then clTotal = i
        If clTemp = "Description" Then clDesc = i
   Next i
   
   If gridcount > 0 Then
        grid.DeleteGridRows 1, gridcount
    End If
    
   cust_num = ThisForm.Components("CustomerEdit").Text
   
   startline = True
   Open Filename$ For Input As #FileHandle
            xcqfile = True
            While Not EOF(1)
                Line Input #FileHandle, myLine
                If startline = False Then
                    myLineLen = Len(Trim(myLine))
                    cusitem = Trim(Mid(myLine, 37, 18))
                    myLine = Right(myLine, myLineLen - 96)
                    myLineLen = Len(Trim(myLine))
                    
                    Call Chkitem(cusitem, cust_num)
                    
                    While myLineLen > 0
                        y = Left(myLine, 4)
                        m = Mid(myLine, 5, 2)
                        total = Val(Mid(myLine, 7, 7))
                        myLine = Right(myLine, myLineLen - 13)
                        myLineLen = Len(Trim(myLine))
                                           
                        If y <> "0000" And m <> "00" Then
                            curRow = grid.GetGridRowCount + 1
                            grid.InsertGridRows curRow, 1
                            grid.SetGridValue curRow, clY, y
                            grid.SetGridValue curRow, clM, m
                            grid.SetGridValue curRow, clitem, ThisForm.Variables("Item").Value
                            grid.SetGridValue curRow, clCusitem, cusitem
                            grid.SetGridValue curRow, clTotal, total
                            grid.SetGridValue curRow, clDesc, ThisForm.Variables("description").Value
                        End If
                    Wend
                End If
                startline = False
            Wend
            Close #FileHandle
            
            grid.ForceRepaint
            
            
            Call InsertTmpForecast
            
Exit Sub
Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
End Sub

Sub PreviewKMT()

 
  Dim TextLine$, Filename$
  Dim FileHandle As Integer
  Dim iRow, iCol As Integer

  Dim oGrid As Object
  Dim iCurrentRow As Integer
  Dim iCurrentColumn As Integer
  Dim iRowCount As Integer
  
  Dim ExcelWorksheet As Object
  Dim Connection As IIDOConnection
  Dim Command As IIDOCommand
  Dim RecSet As IIDORecordset
  Dim cust_num As String
  Dim myxl As Variant
  
 i = 1
  Filename$ = Trim(ThisForm.Components("DerDescEdit").Text)
  
  If Dir(Filename$) = "" Then Exit Sub
  
  FileHandle = FreeFile ' This is safer than assigning a number
 
  iRow = 1
  iCol = 1
  
    Set grid = ThisForm.Components("SalesGrid")
    gridcount = grid.GetGridRowCount
   
   For i = 1 To 6
        clTemp = grid.GetGridValue(0, i)
        If clTemp = "Year" Then clY = i
        If clTemp = "Month" Then clM = i
        If clTemp = "Item" Then clitem = i
        If clTemp = "Cust Item" Then clCusitem = i
        If clTemp = "Qty" Then clTotal = i
        If clTemp = "Description" Then clDesc = i
   Next i
   
   If gridcount > 0 Then
        grid.DeleteGridRows 1, gridcount
    End If
    
    
   
  Open Filename$ For Input As #FileHandle
  
            Dim j As Integer
            Dim t As String
                    
            i = 1
            j = 5
      
            Set ExcelWorksheet = GetObject(Filename$)

            If Err.Number <> 0 Then ExcelWasNotRunning = True
            Err.Clear
             
            Set myxl = GetObject(Filename$)
            
            myxl.Application.Visible = False
            myxl.Parent.Windows(1).Visible = True
            
            
            Do While Not myxl.Application.cells(i, 1).Value = "<EOF>"
                
                If i = 2 Then
                   y1 = Right(myxl.Application.cells(i, 5).Value, 4)
                   m1 = Left(myxl.Application.cells(i, 5).Value, 2)
                   m2 = Left(myxl.Application.cells(i, 6).Value, 2)
                   y2 = Right(myxl.Application.cells(i, 6).Value, 4)
                   m3 = Left(myxl.Application.cells(i, 7).Value, 2)
                   y3 = Right(myxl.Application.cells(i, 7).Value, 4)
                
                End If
                      
                      If i >= 3 Then
                         cusitem = myxl.Application.cells(i, 3).Value
                        Do While j < 8
                         
                       If j = 5 Then
                          m = m1
                          y = y1
                       Else
                             If j = 6 Then
                             m = m2
                             y = y2
                             Else
                             m = m3
                             y = y3
                             End If
                      End If
                         cust_num = ThisForm.Components("CustomerEdit").Text
                                             
                         total = myxl.Application.cells(i, j).Value
                         
                         Call Chkitem(cusitem, cust_num)
                        
                          If total <> 0 Then
                          
                          curRow = grid.GetGridRowCount + 1
                          grid.InsertGridRows curRow, 1
                          grid.SetGridValue curRow, clY, y
                          grid.SetGridValue curRow, clM, m
                          grid.SetGridValue curRow, clitem, ThisForm.Variables("Item").Value
                          grid.SetGridValue curRow, clCusitem, cusitem
                          grid.SetGridValue curRow, clTotal, total
                          grid.SetGridValue curRow, clDesc, ThisForm.Variables("description").Value
                          
                          End If
                          
                         j = j + 1
                    
                        Loop
                 
                   End If
                i = i + 1
                j = 5
                
            Loop
            
            If ExcelWasNotRunning = True Then
                myxl.Application.Quit
            End If
            Set myxl = Nothing

    
    grid.ForceRepaint
     Call InsertTmpForecast
  
Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
           
      
 End Sub
  
  

    
Sub PreviewIszGM()


  Dim TextLine$, Filename$
  Dim FileHandle As Integer
  Dim iRow, iCol As Integer

  Dim oGrid As Object
  Dim iCurrentRow As Integer
  Dim iCurrentColumn As Integer
  Dim iRowCount As Integer
  
  Dim ExcelWorksheet As Object
  Dim Connection As IIDOConnection
  Dim Command As IIDOCommand
  Dim RecSet As IIDORecordset
  Dim cust_num As String
  Dim myxl As Variant
         
  

  i = 1
  Filename$ = Trim(ThisForm.Components("DerDescEdit").Text)
  
  If Dir(Filename$) = "" Then Exit Sub
  
  FileHandle = FreeFile ' This is safer than assigning a number
 
  iRow = 1
  iCol = 1
  
  Set grid = ThisForm.Components("SalesGrid")
    gridcount = grid.GetGridRowCount

   If gridcount > 0 Then
        grid.DeleteGridRows 1, gridcount
    End If
 
  
  
  Open Filename$ For Input As #FileHandle
  
            
            Set ExcelWorksheet = GetObject(Filename$)

            If Err.Number <> 0 Then ExcelWasNotRunning = True
            Err.Clear
             
            Set myxl = GetObject(Filename$)
            
            myxl.Application.Visible = False
            myxl.Parent.Windows(1).Visible = True
            
            Do While Not myxl.Application.cells(i, 1).Value = "<EOF>"
                
                customer = ThisForm.Components("CustomerEdit").Text
                
                cust_num = customer
                
                cusitem = Trim(myxl.Application.cells(i, 2).Value)
                y = myxl.Application.cells(i, 3).Value
                m = myxl.Application.cells(i, 4).Value
                total = myxl.Application.cells(i, 5).Value
                'nstitem = myxl.Application.cells(i, 8).Value
                           
                Call Chkitem(cusitem, cust_num)
                
                nstitem = ThisForm.Variables("Item").Value

                
                
                If Trim(customer) <> "" Then
                grid.InsertGridRows 1, 1
                grid.SetGridTopRow (1)
                grid.SetGridValue 1, 1, y
                grid.SetGridValue 1, 2, m
                grid.SetGridValue 1, 3, nstitem
                grid.SetGridValue 1, 4, cusitem
                grid.SetGridValue 1, 5, total
                grid.SetGridValue 1, 6, ThisForm.Variables("description").Value
               
                 
                End If
                i = i + 1
            Loop
            
            If ExcelWasNotRunning = True Then
                myxl.Application.Quit
            End If
            Set myxl = Nothing
            
            grid.ForceRepaint
            
         
            Call InsertTmpForecast
            
            
  
  

Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
End Sub
Sub PreviewIszGW()


  Dim TextLine$, Filename$
  Dim FileHandle As Integer
  Dim iRow, iCol As Integer

  Dim oGrid As Object
  Dim iCurrentRow As Integer
  Dim iCurrentColumn As Integer
  Dim iRowCount As Integer
  
  Dim ExcelWorksheet As Object
  Dim po_Qty As Double
  Dim due_date As Date
  Dim cust_po As String
  Dim Item As String
  Dim cont_price As Double
  Dim cust_seq As Integer
  Dim Connection As IIDOConnection
  Dim Command As IIDOCommand
  Dim RecSet As IIDORecordset
  Dim custt_po As String
  

  i = 1
  Filename$ = Trim(ThisForm.Components("DerDescEdit").Text)
  
  If Dir(Filename$) = "" Then Exit Sub
  
  FileHandle = FreeFile ' This is safer than assigning a number
 
  iRow = 1
  iCol = 1
  
   
  Open Filename$ For Input As #FileHandle
  
  
  
  Do While Not EOF(FileHandle)         ' Loop until end of file
  
     
     
     Line Input #FileHandle, TextLine$  ' Read line into variable
     
     
     If Trim(Mid(TextLine$, 1, 1)) <> "" And Trim(Mid(TextLine$, 1, 3)) <> "REC" Then
     Set Connection = Application.SessionManager.AppDBConnection
     Set Command = Connection.CreateCommand
          
    
   
        cust_po = Trim(Mid(TextLine$, 3, 10))
        due_date = Mid(TextLine$, 57, 2) & "/" & Mid(TextLine$, 55, 2) & "/" & Mid(TextLine$, 51, 4)
        po_Qty = Round(CDec(Trim(Mid(TextLine$, 59, 6))), 0)
        
        
        'MsgBox (Trim(Mid(TextLine$, 135, 5)))
        
        
        
        
     strItem = ""
     strItem = "select top 1 item" _
               & " from itemcust" _
               & " where itemcust.cust_num = " & "'" & ThisForm.Components("CustomerEdit").Text & "'" _
               & " and itemcust.cust_item = " & "'" & Trim(Mid(TextLine$, 36, 10)) & "'"
      Command.CommandText = strItem
      Set RecSet = Command.Execute
      If Not RecSet.EndOfResultSet Then
               Item = RecSet.GetColumnValue("item")
      End If
     
     Set Connection = Application.SessionManager.AppDBConnection
     Set Command = Connection.CreateCommand
       
     strItem = ""
     strItem = "select description" _
               & " from item" _
               & " where item.item = " & "'" & Item & "'"
               
               
      Command.CommandText = strItem
      Set RecSet = Command.Execute
      If Not RecSet.EndOfResultSet Then
               Description = RecSet.GetColumnValue("description")
      End If
      
     
     Set Connection = Application.SessionManager.AppDBConnection
     Set Command = Connection.CreateCommand
       
     strItem = ""
     strItem = "select top 1 cont_price" _
               & " from itemcustprice" _
               & " where itemcustprice.cust_num = " & "'" & ThisForm.Components("CustomerEdit").Text & "'" _
               & " and itemcustprice.item = " & "'" & Item & "'" _
               & " and itemcustprice.effect_date <= " & "'" & Format(due_date, "YYYY-MM-DD") & "'" _
               & " order by itemcustprice.effect_date desc"
               
               
      Command.CommandText = strItem
      Set RecSet = Command.Execute
      If Not RecSet.EndOfResultSet Then
               cont_price = RecSet.GetColumnValue("cont_price")
      End If
     
     
     
     
     
     Set Connection = Application.SessionManager.AppDBConnection
     Set Command = Connection.CreateCommand
       
      
       strItem = "insert into tmp_coitem" _
               & " (cust_num, item, description, cust_item, qty_ordered, cust_po, plan_code, cust_seq, due_date , price,lot_no)" _
               & " values (" & "'" & ThisForm.Components("CustomerEdit").Text & "'" _
               & "," & "'" & Item & "'" _
               & "," & "'" & Description & "'" _
               & "," & "'" & Trim(Mid(TextLine$, 36, 10)) & "'" _
               & "," & po_Qty _
               & "," & "'" & cust_po & "'" _
               & "," & "''" _
               & "," & 0 _
               & "," & "'" & Format(due_date, "YYYY-MM-DD") & "'" _
               & "," & cont_price _
               & "," & "'" & Trim(Mid(TextLine$, 160, 4)) & "'" _
               & ")"
               
               
                 
        Command.CommandType = idodbCmdText
        Command.CommandText = strItem
        Command.Execute
       

     
     iRow = iRow + 1
     End If
   
Loop
   

Close #FileHandle

Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
End Sub

Sub PreviewIszSR()


  Dim TextLine$, Filename$
  Dim FileHandle As Integer
  Dim iRow, iCol As Integer

  Dim oGrid As Object
  Dim iCurrentRow As Integer
  Dim iCurrentColumn As Integer
  Dim iRowCount As Integer
  
  Dim ExcelWorksheet As Object
  Dim po_Qty As Double
  Dim due_date As Date
  Dim cust_po As String
  Dim Item As String
  Dim cont_price As Double
  Dim cust_seq As Integer
  Dim Connection As IIDOConnection
  Dim Command As IIDOCommand
  Dim RecSet As IIDORecordset
  Dim custt_po As String
  

  i = 1
  Filename$ = Trim(ThisForm.Components("DerDescEdit").Text)
  
  If Dir(Filename$) = "" Then Exit Sub
  
  FileHandle = FreeFile ' This is safer than assigning a number
 
  iRow = 1
  iCol = 1
  
   
  Open Filename$ For Input As #FileHandle
  
  
  
  Do While Not EOF(FileHandle)         ' Loop until end of file
  
     
     
     Line Input #FileHandle, TextLine$  ' Read line into variable
     
     
     If Trim(Mid(TextLine$, 1, 1)) <> "" And Trim(Mid(TextLine$, 1, 3)) <> "REC" Then
     Set Connection = Application.SessionManager.AppDBConnection
     Set Command = Connection.CreateCommand
          
    
   
        cust_po = Trim(Mid(TextLine$, 3, 10))
        due_date = Mid(TextLine$, 57, 2) & "/" & Mid(TextLine$, 55, 2) & "/" & Mid(TextLine$, 51, 4)
        
        
        
        'MsgBox (Trim(Mid(TextLine$, 135, 5)))
        
        
        po_Qty = Round(CDec(Trim(Mid(TextLine$, 59, 6))), 0)
        
     strItem = ""
     strItem = "select top 1 item" _
               & " from itemcust" _
               & " where itemcust.cust_num = " & "'" & ThisForm.Components("CustomerEdit").Text & "'" _
               & " and itemcust.cust_item = " & "'" & Trim(Mid(TextLine$, 36, 10)) & "'"
      Command.CommandText = strItem
      Set RecSet = Command.Execute
      If Not RecSet.EndOfResultSet Then
               Item = RecSet.GetColumnValue("item")
      End If
     
     Set Connection = Application.SessionManager.AppDBConnection
     Set Command = Connection.CreateCommand
       
     strItem = ""
     strItem = "select description" _
               & " from item" _
               & " where item.item = " & "'" & Item & "'"
               
               
      Command.CommandText = strItem
      Set RecSet = Command.Execute
      If Not RecSet.EndOfResultSet Then
               Description = RecSet.GetColumnValue("description")
      End If
      
      Set Connection = Application.SessionManager.AppDBConnection
      Set Command = Connection.CreateCommand
       
     
      
      strItem = ""
      strItem = "select cust_seq" _
               & " from custaddr" _
               & " where custaddr.cust_num = " & "'" & ThisForm.Components("CustomerEdit").Text & "'" _
               & " and Left(custaddr.name,2) = " & "'" & Trim(Mid(TextLine$, 127, 2)) & "'"
              
               
               
      Command.CommandText = strItem
      Set RecSet = Command.Execute
      If Not RecSet.EndOfResultSet Then
               cust_seq = RecSet.GetColumnValue("cust_seq")
      End If
     
     Set Connection = Application.SessionManager.AppDBConnection
     Set Command = Connection.CreateCommand
       
     strItem = ""
     strItem = "select top 1 cont_price" _
               & " from itemcustprice" _
               & " where itemcustprice.cust_num = " & "'" & ThisForm.Components("CustomerEdit").Text & "'" _
               & " and itemcustprice.item = " & "'" & Item & "'" _
               & " and itemcustprice.effect_date <= " & "'" & Format(due_date, "YYYY-MM-DD") & "'" _
               & " order by itemcustprice.effect_date desc"
               
               
      Command.CommandText = strItem
      Set RecSet = Command.Execute
      If Not RecSet.EndOfResultSet Then
               cont_price = RecSet.GetColumnValue("cont_price")
      End If
     
     
     
     
     
     Set Connection = Application.SessionManager.AppDBConnection
     Set Command = Connection.CreateCommand
       
      
       strItem = "insert into tmp_coitem" _
               & " (cust_num, item, description, cust_item, qty_ordered, cust_po, plan_code, cust_seq, due_date , price, lot_no)" _
               & " values (" & "'" & ThisForm.Components("CustomerEdit").Text & "'" _
               & "," & "'" & Item & "'" _
               & "," & "'" & Description & "'" _
               & "," & "'" & Trim(Mid(TextLine$, 36, 10)) & "'" _
               & "," & po_Qty _
               & "," & "'" & cust_po & "'" _
               & "," & "'" & Trim(Mid(TextLine$, 127, 2)) & "'" _
               & "," & cust_seq _
               & "," & "'" & Format(due_date, "YYYY-MM-DD") & "'" _
               & "," & cont_price _
                & "," & "'" & Trim(Mid(TextLine$, 160, 4)) & "'" _
               & ")"
               
               
                 
        Command.CommandType = idodbCmdText
        Command.CommandText = strItem
        Command.Execute
       

     
     iRow = iRow + 1
     End If
   
Loop
   

Close #FileHandle

Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
End Sub
Sub PreviewTYM()


  Dim TextLine$, Filename$
  Dim FileHandle As Integer
  Dim iRow, iCol As Integer

  Dim oGrid As Object
  Dim iCurrentRow As Integer
  Dim iCurrentColumn As Integer
  Dim iRowCount As Integer
  
  Dim ExcelWorksheet As Object
  Dim po_Qty As Double
  Dim due_date As Date
  Dim cust_po As String
  Dim Item As String
  Dim cont_price As Double
  Dim cust_seq As Integer
  Dim Connection As IIDOConnection
  Dim Command As IIDOCommand
  Dim RecSet As IIDORecordset
  Dim chk_comma1 As Integer
  Dim nxt_comma1 As String
  Dim mnt1(6) As String
  Dim mnt_value(6) As Long
  Dim tmp(20) As String
  Dim fct_date1 As Date
  Dim cust_num As String
  

  i = 1
  Filename$ = Trim(ThisForm.Components("DerDescEdit").Text)
  
  If Dir(Filename$) = "" Then Exit Sub
  
  FileHandle = FreeFile ' This is safer than assigning a number
   Set grid = ThisForm.Components("SalesGrid")
    gridcount = grid.GetGridRowCount
   
   For i = 1 To 6
        clTemp = grid.GetGridValue(0, i)
        If clTemp = "Year" Then clY = i
        If clTemp = "Month" Then clM = i
        If clTemp = "Item" Then clitem = i
        If clTemp = "Cust Item" Then clCusitem = i
        If clTemp = "Qty" Then clTotal = i
        If clTemp = "Description" Then clDesc = i
   Next i
   
   If gridcount > 0 Then
        grid.DeleteGridRows 1, gridcount
    End If
    
   combDate = ThisForm.Components("cmbDate").Text
            combYear = ThisForm.Components("cmbYear").Text
            
           If combYear = "" Or combDate = "" Then
               MsgBox ("Please Select Month and Year  Forecast")
           Else

   
  Open Filename$ For Input As #FileHandle
 
 cust_num = ThisForm.Components("CustomerEdit").Text
              
            startline = True
            xcqfile = True
            While Not EOF(1)
                Line Input #FileHandle, myLine
                myLine = Trim(myLine)
                myLineLen = Len(Trim(myLine))
                    tmp(1) = Left(myLine, 14)
                    myLine = Right(myLine, myLineLen - 22)
                    myLineLen = Len(Trim(myLine))
                    
                    tmp(2) = Left(myLine, 8)
                    myLine = Right(myLine, myLineLen - 8)
                    myLineLen = Len(Trim(myLine))
                    
                    tmp(3) = Left(myLine, 8)
                    myLine = Right(myLine, myLineLen - 8)
                    myLineLen = Len(Trim(myLine))
                    
                    tmp(4) = Left(myLine, 8)
                        
                    cusitem = tmp(1)
                    
                    For i = 2 To 4
                        If i = 2 Then
                            mnt_value(i - 1) = tmp(2)
                        ElseIf i = 3 Then
                            mnt_value(i - 1) = tmp(3)
                        ElseIf i = 4 Then
                            mnt_value(i - 1) = tmp(4)
                    
                        End If
                    Next i
                    
                    For i = 1 To 3
                    If i = 1 Then
                        fct_date1 = CDate(combYear & "-" & combDate & "-" & "30")
                            y = CStr(Year(fct_date1))
                            m = CStr(Month(fct_date1))
                                If Len(Month(fct_date1)) = 1 Then
                                    m = "0" & m
                                End If
                                
                                If m = "13" Then
                                   m = "01"
                                   y = y + 1
                                ElseIf m = "14" Then
                                    m = "02"
                                    y = y + 1
                                End If
                                
                                If m = "02" Then
                                    D = "28"
                                Else: D = CStr(Day(fct_date1))
                                End If
                            'D = DateAdd("m", 1, fct_date1)
                            'D = Day(DateAdd("d", -1, D))
                            
                     ElseIf i = 2 Then
                        fct_date1 = CDate(combYear & "-" & combDate & "-" & "30")
                            y = CStr(Year(fct_date1))
                            'm = CStr(Month(fct_date1))
                            m = CStr(Month(fct_date1))
                                If Len(Month(fct_date1) + 1) = 1 Then
                                    m = "0" & (m + 1)
                                Else: m = m + 1
                                End If
                                
                                If m = "13" Then
                                   m = "01"
                                   y = y + 1
                                ElseIf m = "14" Then
                                    m = "02"
                                    y = y + 1
                                End If
                                
                                If m = "02" Then
                                    D = "28"
                                Else: D = CStr(Day(fct_date1))
                                End If
                    ElseIf i = 3 Then
                        fct_date1 = CDate(combYear & "-" & combDate & "-" & "30")
                            y = CStr(Year(fct_date1))
                            m = CStr(Month(fct_date1))
                                
                                If Len(Month(fct_date1) + 2) = 1 Then
                                    m = "0" & CStr((Month(fct_date1) + 2))
                                Else: m = CStr((Month(fct_date1) + 2))
                                End If
                                    
                                If m = "13" Then
                                   m = "01"
                                   y = y + 1
                                ElseIf m = "14" Then
                                    m = "02"
                                    y = y + 1
                                End If
                                
                                If m = "02" Then
                                    D = "28"
                                Else: D = CStr(Day(fct_date1))
                                End If
                                
                    End If
                        total = mnt_value(i)
                        
                         Call Chkitem(cusitem, cust_num)
                        
                        
                        If total <> 0 Then
                        
                            curRow = grid.GetGridRowCount + 1
                            grid.InsertGridRows curRow, 1
                            grid.SetGridValue curRow, clY, y
                            grid.SetGridValue curRow, clM, m
                            grid.SetGridValue curRow, clitem, ThisForm.Variables("Item").Value
                            grid.SetGridValue curRow, clCusitem, cusitem
                            grid.SetGridValue curRow, clTotal, total
                            grid.SetGridValue curRow, clDesc, ThisForm.Variables("description").Value
                        End If
                    Next i
             
                startline = False
            Wend
   
            
            Close #FileHandle
            End If
              
            grid.ForceRepaint
            
            
            Call InsertTmpForecast
  
Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
End Sub

Sub ClearScreen()

  Dim TextLine$, Filename$
  Dim FileHandle As Integer
  Dim iRow, iCol As Integer

  Dim oGrid As Object
  Dim iCurrentRow As Integer
  Dim iCurrentColumn As Integer
  Dim iRowCount As Integer

    ThisForm.Components("DerDescEdit").Text = ""
    ThisForm.Components("CustomerEdit").Text = ""
    ThisForm.Components("CustName").Text = ""
    ThisForm.Components("THM").Text = "0"
    ThisForm.Components("TSM").Text = "0"
    ThisForm.Components("TYM").Text = "0"
    ThisForm.Components("IszGM").Text = "0"
    ThisForm.Components("KMT").Text = "0"
    ThisForm.Components("TYM1").Text = "0"
    ThisForm.Components("TYM2").Text = "0"
    ThisForm.Components("KMT2").Text = "0"
    ThisForm.Components("DerDescEdit").Enabled = False
    ThisForm.Components("CustomerEdit").Enabled = False
    ThisForm.Components("CustName").Enabled = False
    ThisForm.Components("THM").Enabled = True
    ThisForm.Components("TSM").Enabled = True
    ThisForm.Components("TYM").Enabled = True
    ThisForm.Components("TYM2").Enabled = True
    ThisForm.Components("IszGM").Enabled = True
    ThisForm.Components("KMT").Enabled = True
    ThisForm.Components("KMT2").Enabled = True
    ThisForm.Components("TYM1").Enabled = True
    ThisForm.Components("TYM2").Enabled = True
    ThisForm.Components("cmbDate").Enabled = False
    ThisForm.Components("cmbYear").Enabled = False
    ThisForm.Components("cmbDate1").Enabled = False
    
    Set oGrid = ThisForm.Components("SalesGrid")
    iRowCount = ThisForm.Components("SalesGrid").GetGridRowCount
    If iRowCount > o Then
       oGrid.DeleteGridRows 1, iRowCount
    End If
    
     Set oGrid = ThisForm.Components("ForecastGrid")
    iRowCount = ThisForm.Components("ForecastGrid").GetGridRowCount
    If iRowCount > o Then
       oGrid.DeleteGridRows 1, iRowCount
    End If
    ThisForm.Components("ForecastGrid").GetCache.NotifyDependentsToRefresh ("")
    ThisForm.Components("SalesGrid").GetCache.NotifyDependentsToRefresh ("")
    ThisForm.Components("PreviewRadioBtn").Text = "P"

End Sub
Sub ExcelImp()
    
If Trim(ThisForm.Components("DerDescEdit").Text) <> "" Then
       If ThisForm.Components("PreviewRadioBtn").Text = "P" Then
         ' Call Deltmpcoitem
          If ThisForm.Components("THM").Text = "1" Then
          Call PreviewTHM
          End If
          If ThisForm.Components("TSM").Text = "1" Then
          Call PreviewTSM
          End If
          If ThisForm.Components("TYM").Text = "1" Then
          Call PreviewTYM
          End If
          If ThisForm.Components("IszGM").Text = "1" Then
          Call PreviewIszGM
          End If
          If ThisForm.Components("KMT").Text = "1" Then
          Call PreviewKMT
          End If
          If ThisForm.Components("TYM2").Text = "1" Then
          Call PreviewTYM
          End If
           If ThisForm.Components("KMT2").Text = "1" Then
          Call PreviewKMT2
          End If
       
          'Call LoadData
      ElseIf ThisForm.Components("CommitRadioBtn").Text = "C" Then
          Call Commit
      ElseIf ThisForm.Components("SplitRadioBtn").Text = "D" Then
          Call ForecastSplit
      Else
         MsgBox "Please select Activity to process"
         Exit Sub
      End If
      
      'ThisForm.Components("SalesGrid").ForceRepaint
    
      
  Else
     MsgBox "Please select filename for Import data", vbCritical
     SetFocus "DerDescEdit"
     Exit Sub
  End If
          
    

End Sub

Sub Commit()
   
   
   Call InsForecast
       
  
  
  
End Sub
Sub GetCustName()

Dim i As Integer
Dim filter As String
Dim objSession As Object
Dim ObjTax As Object

filter = "CustNum ='" & ThisForm.Components("CustomerEdit") & "' and CustSeq = 0 "

Set objSession = CreateObject("Symix.SessionInterface")
objSession.SessionObject = Symix.SessionManager
Set ObjTax = objSession.LoadCollection("SL.SLCustomers", "Name, TermsCode, TaxCode1", filter, -1, "")
             

    
   Do While Not ObjTax.EOF

        ThisForm.Components("CustName").Text = ObjTax.GetProperty("Name")
        ThisForm.Variables("TermsCode").Value = ObjTax.GetProperty("TermsCode")
        ThisForm.Variables("TaxCode").Value = ObjTax.GetProperty("TaxCode1")
       
        
        ObjTax.MoveNext
    Loop





End Sub


Sub AssignCustNum()



If ThisForm.Components("THM").Text = "1" Then
   ThisForm.Components("CustomerEdit").Enabled = True
   ThisForm.Components("CustomerEdit").Text = "C000004"
   ThisForm.Components("TSM").Enabled = False
   ThisForm.Components("TYM").Enabled = False
   ThisForm.Components("IszGM").Enabled = False
   ThisForm.Components("KMT").Enabled = False
    ThisForm.Components("TYM2").Enabled = False
    ThisForm.Components("KMT2").Enabled = False
   ThisForm.Components("DerDescEdit").Enabled = True
   Call GetCustName
   ThisForm.Components("cmbDate").Enabled = False
   ThisForm.Components("cmbDate").Required = False
   ThisForm.Components("cmbYear").Enabled = False
   ThisForm.Components("cmbYear").Required = False
   ThisForm.Components("cmbDate1").Enabled = False
   ThisForm.Components("cmbDate1").Required = False
End If

If ThisForm.Components("TSM").Text = "1" Then
   ThisForm.Components("CustomerEdit").Enabled = True
   ThisForm.Components("CustomerEdit").Text = "C000001"
   ThisForm.Components("THM").Enabled = False
   ThisForm.Components("TYM").Enabled = False
   ThisForm.Components("IszGM").Enabled = False
     ThisForm.Components("KMT").Enabled = False
    ThisForm.Components("TYM2").Enabled = False
     ThisForm.Components("KMT2").Enabled = False
   ThisForm.Components("DerDescEdit").Enabled = True
   Call GetCustName
   ThisForm.Components("cmbDate").Enabled = False
   ThisForm.Components("cmbDate").Required = False
   ThisForm.Components("cmbYear").Enabled = False
   ThisForm.Components("cmbYear").Required = False
    ThisForm.Components("cmbDate1").Enabled = False
   ThisForm.Components("cmbDate1").Required = False
   
End If

If ThisForm.Components("TYM").Text = "1" Then
   ThisForm.Components("CustomerEdit").Enabled = True
   ThisForm.Components("CustomerEdit").Text = "C000002"
   ThisForm.Components("THM").Enabled = False
   ThisForm.Components("TSM").Enabled = False
   ThisForm.Components("IszGM").Enabled = False
    ThisForm.Components("KMT").Enabled = False
   ThisForm.Components("TYM2").Enabled = False
    ThisForm.Components("KMT2").Enabled = False
   ThisForm.Components("DerDescEdit").Enabled = True
   Call GetCustName
   ThisForm.Components("cmbDate").Enabled = True
   ThisForm.Components("cmbDate").Required = True
   ThisForm.Components("cmbYear").Enabled = True
   ThisForm.Components("cmbYear").Required = True
    ThisForm.Components("cmbDate1").Enabled = False
   ThisForm.Components("cmbDate1").Required = False
   
End If

If ThisForm.Components("IszGM").Text = "1" Then
   ThisForm.Components("CustomerEdit").Enabled = True
   ThisForm.Components("CustomerEdit").Text = "C000056"
   ThisForm.Components("THM").Enabled = False
   ThisForm.Components("TSM").Enabled = False
   ThisForm.Components("TYM").Enabled = False
   ThisForm.Components("KMT").Enabled = False
   ThisForm.Components("TYM2").Enabled = False
    ThisForm.Components("KMT2").Enabled = False
   ThisForm.Components("DerDescEdit").Enabled = True
   Call GetCustName
    ThisForm.Components("cmbDate").Enabled = False
   ThisForm.Components("cmbDate").Required = False
   ThisForm.Components("cmbYear").Enabled = False
   ThisForm.Components("cmbYear").Required = False
   ThisForm.Components("cmbDate1").Enabled = True
   ThisForm.Components("cmbDate1").Required = True
End If

If ThisForm.Components("KMT").Text = "1" Then
   ThisForm.Components("CustomerEdit").Enabled = True
   ThisForm.Components("CustomerEdit").Text = "C000003"
   ThisForm.Components("THM").Enabled = False
   ThisForm.Components("TSM").Enabled = False
   ThisForm.Components("TYM").Enabled = False
   ThisForm.Components("IszGM").Enabled = False
    ThisForm.Components("TYM2").Enabled = False
     ThisForm.Components("KMT2").Enabled = False
   ThisForm.Components("DerDescEdit").Enabled = True
   Call GetCustName
    ThisForm.Components("cmbDate").Enabled = False
   ThisForm.Components("cmbDate").Required = False
   ThisForm.Components("cmbYear").Enabled = False
   ThisForm.Components("cmbYear").Required = False
    ThisForm.Components("cmbDate1").Enabled = False
   ThisForm.Components("cmbDate1").Required = False
End If

If ThisForm.Components("TYM2").Text = "1" Then
   ThisForm.Components("CustomerEdit").Enabled = True
   ThisForm.Components("CustomerEdit").Text = "C000002"
   ThisForm.Components("THM").Enabled = False
   ThisForm.Components("TSM").Enabled = False
   ThisForm.Components("TYM").Enabled = False
   ThisForm.Components("KMT").Enabled = False
    ThisForm.Components("KMT2").Enabled = False
   ThisForm.Components("IszGM").Enabled = False
    ThisForm.Components("DerDescEdit").Enabled = True
   Call GetCustName
    ThisForm.Components("cmbDate").Enabled = True
   ThisForm.Components("cmbDate").Required = True
   ThisForm.Components("cmbYear").Enabled = True
   ThisForm.Components("cmbYear").Required = True
    ThisForm.Components("cmbDate1").Enabled = True
   ThisForm.Components("cmbDate1").Required = True
End If

If ThisForm.Components("KMT2").Text = "1" Then
   ThisForm.Components("CustomerEdit").Enabled = True
   ThisForm.Components("CustomerEdit").Text = "C000003"
   ThisForm.Components("THM").Enabled = False
   ThisForm.Components("TSM").Enabled = False
   ThisForm.Components("TYM").Enabled = False
   ThisForm.Components("KMT").Enabled = False
    ThisForm.Components("TYM2").Enabled = False
   ThisForm.Components("IszGM").Enabled = False
    ThisForm.Components("DerDescEdit").Enabled = True
   Call GetCustName
    ThisForm.Components("cmbDate").Enabled = False
   ThisForm.Components("cmbDate").Required = False
   ThisForm.Components("cmbYear").Enabled = False
   ThisForm.Components("cmbYear").Required = False
    ThisForm.Components("cmbDate1").Enabled = True
   ThisForm.Components("cmbDate1").Required = True
   

   
End If
End Sub

Sub Deltmpcoitem()

Dim TextLine$, Filename$
Dim FileHandle As Integer
Dim iRow, iCol As Integer
Dim oGrid As Object
Dim iCurrentRow As Integer
Dim iCurrentColumn As Integer
Dim iRowCount As Integer
Dim str As String
Dim PoLineVar As Integer
Dim MessageError As String
Dim Error As String
Dim strItem As String
Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset

      Set Connection = Application.SessionManager.AppDBConnection
      Set Command = Connection.CreateCommand

      strItem = ""
      strItem = "delete tmp_coitem"
      Command.CommandType = idodbCmdText
      Command.CommandText = strItem
      Command.Execute
      
   
    Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
    

End Sub


Sub ChkCustpo()

Dim i As Integer
Dim iRow, iCol As Integer
Dim oGrid As Object
Dim iCurrentRow As Integer
Dim iCurrentColumn As Integer
Dim iRowCount As Integer
Dim MessageError As String
Dim Error As String
Dim strcustpo As String
Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset

              Set Connection = Application.SessionManager.AppDBConnection
              Set Command = Connection.CreateCommand
       
              strcustpo = ""
              strcustpo = "select top 1 uf_2p2c_custpo" _
               & " from coitem" _
               & " inner join co on co.co_num = coitem.co_num" _
               & " where co.cust_num = " & "'" & Trim(ThisForm.Variables("CustNum").Value) & "'" _
               & " and coitem.item = " & "'" & Trim(ThisForm.Variables("item").Value) & "'" _
               & " and coitem.uf_2p2c_custpo = " & "'" & Trim(ThisForm.Variables("custpo").Value) & "'"
     
               
               ThisForm.Variables("Error").Value = ""
      Command.CommandText = strcustpo
      Set RecSet = Command.Execute
       Do While Not RecSet.EndOfResultSet
       
                
                ThisForm.Variables("Error").Value = "Duplicate Cust PO"
               
             
       RecSet.MoveNext
      Loop
     
     Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0

End Sub

Sub ChkItemCost()

Dim i As Integer
Dim iRow, iCol As Integer
Dim oGrid As Object
Dim iCurrentRow As Integer
Dim iCurrentColumn As Integer
Dim iRowCount As Integer
Dim MessageError As String
Dim Error As String
Dim strItemcost As String
Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset

Set Connection = Application.SessionManager.AppDBConnection
              Set Command = Connection.CreateCommand
       
              strItemcost = ""
              strItemcost = "select top 1 matl_cost, lbr_cost, fovhd_cost, vovhd_cost, out_cost" _
               & " from item" _
               & " where item.item = " & "'" & Trim(ThisForm.Variables("item").Value) & "'"
     
               
               
      Command.CommandText = strItemcost
      Set RecSet = Command.Execute
      Do While Not RecSet.EndOfResultSet
          
            ThisForm.Variables("mat_cost").Value = RecSet.GetColumnValue("matl_cost")
            ThisForm.Variables("lbr_cost").Value = RecSet.GetColumnValue("lbr_cost")
            ThisForm.Variables("fovhd_cost").Value = RecSet.GetColumnValue("fovhd_cost")
            ThisForm.Variables("vovhd_cost").Value = RecSet.GetColumnValue("vovhd_cost")
            ThisForm.Variables("out_cost").Value = RecSet.GetColumnValue("out_cost")
            ThisForm.Variables("total_cost").Value = CDbl(RecSet.GetColumnValue("matl_cost")) + CDbl(RecSet.GetColumnValue("lbr_cost")) + _
                                                     CDbl(RecSet.GetColumnValue("fovhd_cost")) + CDbl(RecSet.GetColumnValue("vovhd_cost")) + _
                                                     CDbl(RecSet.GetColumnValue("out_cost"))
               
            
            RecSet.MoveNext
            
               
               
      Loop
     
      Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0

End Sub

Sub PreviewTSM()


  Dim TextLine$, Filename$
  Dim FileHandle As Integer
  Dim iRow, iCol As Integer

  Dim oGrid As Object
  Dim iCurrentRow As Integer
  Dim iCurrentColumn As Integer
  Dim iRowCount As Integer
  Dim cust_num As String
  
  Dim ExcelWorksheet As Object
  Dim chk_comma As Integer
  Dim nxt_comma As String
  Dim mnt(6) As String
  Dim mnt_value(6) As Long
  Dim tmp(20) As String
  Dim fct_date As Date

  

  i = 1
  Filename$ = Trim(ThisForm.Components("DerDescEdit").Text)
  
  If Dir(Filename$) = "" Then Exit Sub
  
  FileHandle = FreeFile ' This is safer than assigning a number
  
     If Err.Number <> 0 Then ExcelWasNotRunning = True
    Err.Clear    ' Clear Err object in case error occurred.
    
     Set grid = ThisForm.Components("SalesGrid")
    gridcount = grid.GetGridRowCount
   
    For i = 1 To 6
        clTemp = grid.GetGridValue(0, i)
        If clTemp = "Year" Then clY = i
        If clTemp = "Month" Then clM = i
        If clTemp = "Item" Then clitem = i
        If clTemp = "Cust Item" Then clCusitem = i
        If clTemp = "Qty" Then clTotal = i
        If clTemp = "Description" Then clDesc = i
   Next i
 
    If gridcount > 0 Then
        grid.DeleteGridRows 1, gridcount
    End If
    
   cust_num = ThisForm.Components("CustomerEdit").Text
    
            
            startline = True
            Open Filename$ For Input As #FileHandle
            xcqfile = True
            While Not EOF(1)
                Line Input #FileHandle, myLine
                myLine = Trim(myLine)
                myLineLen = Len(Trim(myLine))
                i = 1
                If startline = True Then
                   
                   
                    While myLineLen > 0
                        chk_comma = InStr(1, myLine, ",")
                        If chk_comma = 0 Then
                            tmp(i) = myLine
                        Else
                            tmp(i) = Left(myLine, chk_comma - 1)
                        End If
                        tmp(i) = Mid(tmp(i), 2, Len(tmp(i)) - 2)
                        If chk_comma = 0 Then
                            myLine = ""
                        Else
                            myLine = Right(myLine, myLineLen - chk_comma)
                        End If
                        myLineLen = Len(Trim(myLine))
                        i = i + 1
                    Wend
                    For i = 1 To 6
                        mnt(i) = tmp(i + 2)
                    Next i
                    fct_date = Format(tmp(9), "DD/MM/YYYY")
                Else
                    While myLineLen > 0
                        chk_comma = InStr(1, myLine, ",")
                        If chk_comma = 0 Then
                            tmp(i) = myLine
                        Else
                            While Asc(Mid(myLine, chk_comma + 1, 1)) <> 34
                                chk_comma = InStr(chk_comma + 1, myLine, ",")
                            Wend
                            tmp(i) = Left(myLine, chk_comma - 1)
                        End If
                        tmp(i) = Mid(tmp(i), 2, Len(tmp(i)) - 2)
                        If chk_comma = 0 Then
                            myLine = ""
                        Else
                            myLine = Right(myLine, myLineLen - chk_comma)
                        End If
                        myLineLen = Len(Trim(myLine))
                        i = i + 1
                    Wend
                    
                    cusitem = tmp(1)
                    
                                     
                    Call Chkitem(cusitem, cust_num)
                    For i = 3 To 8
                        mnt_value(i - 2) = tmp(i)
                    Next i
                    
                    For i = 1 To 6
                        If Month(fct_date) > Month(CDate("01/" & mnt(i) & "/2000")) Then
                            y = Year(fct_date) + 1
                        Else
                            y = Year(fct_date)
                        End If
                        m = Month(CDate("01/" & mnt(i) & "/2000"))
                        total = mnt_value(i)
              
                        
                                           
                        curRow = grid.GetGridRowCount + 1
                        grid.InsertGridRows curRow, 1
                        grid.SetGridValue curRow, clY, y
                        grid.SetGridValue curRow, clM, m
                        grid.SetGridValue curRow, clitem, ThisForm.Variables("Item").Value
                        grid.SetGridValue curRow, clCusitem, cusitem
                        grid.SetGridValue curRow, clTotal, total
                        grid.SetGridValue curRow, clDesc, ThisForm.Variables("description").Value
                       
                    Next i
                End If
                startline = False
            Wend
            Close #FileHandle
            grid.ForceRepaint
            
         
            
            Call InsertTmpForecast
 
     

Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
End Sub


Sub FindNextKeys()

Dim i As Integer
Dim iRow, iCol As Integer
Dim oGrid As Object
Dim iCurrentRow As Integer
Dim iCurrentColumn As Integer
Dim iRowCount As Integer
Dim MessageError As String
Dim Error As String
Dim strkey As String
Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset

Set Connection = Application.SessionManager.AppDBConnection
              Set Command = Connection.CreateCommand
       
              strkey = ""
              strkey = "select top 1 keyid" _
               & " from NextKeys" _
               & " WHERE TableColumnName = 'co.co_num' AND KeyPrefix = '1'" _
               & " order by keyid desc"
               
               
               
      Command.CommandText = strkey
      Set RecSet = Command.Execute
      Do While Not RecSet.EndOfResultSet
          
            ThisForm.Variables("conum").Value = RecSet.GetColumnValue("keyid")
            'MsgBox (ThisForm.Variables("conum").Value)
           
            RecSet.MoveNext
            
               
               
      Loop
     
    Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0

End Sub

Sub UpdateNextKeys()

Dim i As Integer
Dim iRow, iCol As Integer
Dim oGrid As Object
Dim iCurrentRow As Integer
Dim iCurrentColumn As Integer
Dim iRowCount As Integer
Dim MessageError As String
Dim Error As String
Dim strkey As String
Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset

             Set Connection = Application.SessionManager.AppDBConnection
              Set Command = Connection.CreateCommand
       
       
              strkey = ""
              strkey = "insert NextKeys (TableColumnName, KeyPrefix, KeyID)" _
               & " Values ('co.co_num'" _
               & "," & "'1'" _
               & "," & ThisForm.Variables("conum").Value _
               & ")"
               
               
      Command.CommandText = strkey
      Set RecSet = Command.Execute
     
     
    Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0

End Sub
Sub InsertCO()

Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset
Dim oParms As IIDOParameter
Dim oParms1 As IIDOParameter
Dim oParms2 As IIDOParameter
Dim oParms3 As IIDOParameter
Dim oParms4 As IIDOParameter
Dim oParms5 As IIDOParameter
Dim oParms6 As IIDOParameter
Dim oParms7 As IIDOParameter
Dim oParms8 As IIDOParameter
Dim oParms9 As IIDOParameter

       Set Connection = Application.SessionManager.AppDBConnection
       Set Command = Connection.CreateCommand
        
       Command.CommandType = idodbCmdStoredProc
       Command.CommandText = "SP_2P2CInsertCO"
       
       Set oParms = Command.CreateParameter("@conum", idodbText, idodbInput, 10, 1, ThisForm.Variables("conum").Value)
       Set oParms1 = Command.CreateParameter("@custnum", idodbText, idodbInput, 7, 1, ThisForm.Components("CustomerEdit").Text)
       Set oParms2 = Command.CreateParameter("@custseq", idodbInteger, idodbInput, 20, 1, Int(ThisForm.Components("BoxGrid").Text))
       Set oParms3 = Command.CreateParameter("@orderdate", idodbDateTime, idodbInput, 20, 1, Format(Date, "YYYY-MM-DD"))
       Set oParms4 = Command.CreateParameter("@termscode", idodbText, idodbInput, 3, 1, ThisForm.Variables("TermsCode").Value)
       Set oParms5 = Command.CreateParameter("@price", idodbDecimal, idodbInput, 18, 2, ThisForm.Variables("total").Value)
       Set oParms6 = Command.CreateParameter("@salestax", idodbDecimal, idodbInput, 18, 2, ThisForm.Variables("salestax").Value)
       Set oParms7 = Command.CreateParameter("@cost", idodbDecimal, idodbInput, 18, 2, ThisForm.Variables("totalcost").Value)
       Set oParms8 = Command.CreateParameter("@taxcode", idodbText, idodbInput, 3, 1, ThisForm.Variables("TaxCode").Value)
       Set oParms9 = Command.CreateParameter("@plancode", idodbText, idodbInput, 25, 1, ThisForm.Components("NoteGrid").Text)
       
       Set RecSet = Command.Execute

    Set RecSet = Nothing
    Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0


End Sub

Sub InsertCOLine()

Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset
Dim oParms10 As IIDOParameter
Dim oParms11 As IIDOParameter
Dim oParms12 As IIDOParameter
Dim oParms13 As IIDOParameter
Dim oParms14 As IIDOParameter
Dim oParms15 As IIDOParameter
Dim oParms16 As IIDOParameter
Dim oParms17 As IIDOParameter
Dim oParms18 As IIDOParameter
Dim oParms19 As IIDOParameter
Dim oParms20 As IIDOParameter
Dim oParms21 As IIDOParameter
Dim oParms22 As IIDOParameter
Dim oParms23 As IIDOParameter
Dim oParms24 As IIDOParameter
Dim oParms25 As IIDOParameter
Dim oParms26 As IIDOParameter


       Set Connection = Application.SessionManager.AppDBConnection
       Set Command = Connection.CreateCommand
        
       Command.CommandType = idodbCmdStoredProc
       Command.CommandText = "SP_2P2CInsertCOLine"
       
       If Len(ThisForm.Variables("conum").Value) < 10 Then
           If CDbl(ThisForm.Variables("conum").Value) <= 9999 Then
               ThisForm.Variables("conum").Value = "100000" & CStr(ThisForm.Variables("conum").Value)
           Else
               ThisForm.Variables("conum").Value = "10000" & CStr(ThisForm.Variables("conum").Value)
           End If
       End If
           
       
       Set oParms10 = Command.CreateParameter("@conum", idodbText, idodbInput, 10, 1, ThisForm.Variables("conum").Value)
       Set oParms11 = Command.CreateParameter("@seq", idodbInteger, idodbInput, 4, 1, ThisForm.Variables("seq").Value)
       Set oParms12 = Command.CreateParameter("@item", idodbText, idodbInput, 50, 1, ThisForm.Components("ItemGrid").Text)
       Set oParms13 = Command.CreateParameter("@qtyord", idodbDecimal, idodbInput, 18, 2, ThisForm.Components("QtyGrid").Text)
       Set oParms14 = Command.CreateParameter("@cost", idodbDecimal, idodbInput, 18, 5, ThisForm.Components("TotCostGrid").Text)
       Set oParms15 = Command.CreateParameter("@matlcost", idodbDecimal, idodbInput, 18, 5, ThisForm.Components("MatCost").Text)
       Set oParms16 = Command.CreateParameter("@lbrcost", idodbDecimal, idodbInput, 18, 5, ThisForm.Components("LbrCost").Text)
       Set oParms17 = Command.CreateParameter("@fovhdcost", idodbDecimal, idodbInput, 18, 5, ThisForm.Components("FovhdCost").Text)
       Set oParms18 = Command.CreateParameter("@vovhdcost", idodbDecimal, idodbInput, 18, 5, ThisForm.Components("VovhdCost").Text)
       Set oParms19 = Command.CreateParameter("@outcost", idodbDecimal, idodbInput, 18, 5, ThisForm.Components("OutCost").Text)
       Set oParms20 = Command.CreateParameter("@price", idodbDecimal, idodbInput, 18, 5, ThisForm.Components("UnitPriceGrid").Text)
       Set oParms21 = Command.CreateParameter("@duedate", idodbDateTime, idodbInput, 20, 1, Format(ThisForm.Components("DueDate").Text, "YYYY-MM-DD"))
       Set oParms22 = Command.CreateParameter("@custitem", idodbText, idodbInput, 50, 1, ThisForm.Components("CustItemGrid").Text)
       Set oParms23 = Command.CreateParameter("@custnum", idodbText, idodbInput, 7, 1, ThisForm.Components("CustomerEdit").Text)
       Set oParms24 = Command.CreateParameter("@itemdesc", idodbText, idodbInput, 70, 1, ThisForm.Components("DescriptionGrid").Text)
       Set oParms25 = Command.CreateParameter("@custpo", idodbText, idodbInput, 30, 1, ThisForm.Components("CustpoGrid").Text)
       Set oParms26 = Command.CreateParameter("@lot", idodbText, idodbInput, 30, 1, ThisForm.Components("LotNo").Text)
       
       
       
       
       
       Set RecSet = Command.Execute

    Set RecSet = Nothing
    Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0


End Sub

Sub InsertCustCO()

    Dim oImpExp As Object 'SSSEIMImpExp.clsSSSEIMImpExp
    Dim Connection As IIDOConnection
    Dim Command As IIDOCommand
    Dim RecSet As IIDORecordset
    Dim bNeedLoad As Boolean
    Dim strItem As String
    Dim i As Integer
    Dim VendorVar As String
    Dim GrnNoVar As String
    Dim GrnDateVar As String
    Dim WhseVar As String
    Dim GrnLineVar As Integer
    Dim PoNumVar As String
    Dim PoLineVar As Integer
    Dim PoReleaseVar As Integer
    Dim QtyShippedVar As Double
    Dim UMVar As String
    Dim TrackingNumVar As String
    Dim conum As String
    Dim salestax As Double
    Dim Message As String
    Dim NextKey As Integer
    
    
    
     
    Dim str As String
    Dim strDetail As String
    
        
   
    Set Connection = Application.SessionManager.AppDBConnection
    Set Command = Connection.CreateCommand
    
    ThisForm.Variables("Box").Value = ""
    ThisForm.Variables("PlanCode").Value = ""
    Message = "Your COs : "
    Hseq = 0
    
    
    For i = ThisForm.Components("SalesGrid").GetGridRowCount To 1 Step -1
        ThisForm.Components("SalesGrid").SetGridCurrentCell i, 1
        
       

          If ThisForm.Variables("Box").Value <> ThisForm.Components("BoxGrid").Text Or _
             ThisForm.Variables("PlanCode").Value <> ThisForm.Components("NoteGrid").Text Then
             
                 
                   Call FindNextKeys
                 
                  ' Insert Co
                   
                   NextKey = CDbl(ThisForm.Variables("conum").Value) + 1
                   
                   If CDbl(ThisForm.Variables("conum").Value) <= 9999 Then
                   ThisForm.Variables("conum").Value = "100000" & CStr(NextKey)
                   Else
                   ThisForm.Variables("conum").Value = "10000" & CStr(NextKey)
                   End If
                   
                           
                   Message = Message & "," & ThisForm.Variables("conum").Value
                           
                   ThisForm.Variables("salestax").Value = Round(ThisForm.Variables("total").Value * CDbl(Mid(ThisForm.Variables("TaxCode").Value, 3, 1)), 2)
                   ThisForm.Variables("seq").Value = 1
                   
                   Call InsertCO
                   
                   
                    ThisForm.Variables("conum").Value = NextKey
                    
                    Call UpdateNextKeys
          
               
         End If
         
           
           ' Insert Coitem
           
           Call InsertCOLine
           
           ThisForm.Variables("seq").Value = ThisForm.Variables("seq").Value + 1
          
          ThisForm.Variables("Box").Value = ThisForm.Components("BoxGrid").Text
          ThisForm.Variables("PlanCode").Value = ThisForm.Components("NoteGrid").Text
         
                   
   
   Next i
   
 MsgBox "Import Data Successfully"

 MsgBox (Message)
 
     
    Set oImpExp = Nothing
    Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
    
    Call ClearScreen

End Sub


Sub LoadData()
 
Dim i As Integer
Dim iRow, iCol As Integer
Dim oGrid As Object
Dim iCurrentRow As Integer
Dim iCurrentColumn As Integer
Dim iRowCount As Integer
Dim MessageError As String
Dim Error As String
Dim strItem As String
Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset
Dim total As Double
Dim AccDesc As String
Dim Unit4 As String
Dim mFloor As String
Dim sType As String
Dim sDept As String
Dim sAccount As String
Dim sUnitcd1 As String
Dim samt As Double


    i = 1
    total = 0
    totalcost = 0
 
    Set oGrid = ThisForm.Components("SalesGrid")
    iRowCount = ThisForm.Components("SalesGrid").GetGridRowCount
    If iRowCount > o Then
       oGrid.DeleteGridRows 1, iRowCount
    End If
    
    ThisForm.Components("SalesGrid").GetCache.NotifyDependentsToRefresh ("")
    
    Set Connection = Application.SessionManager.AppDBConnection
    Set Command = Connection.CreateCommand
    
    
    If ThisForm.Variables("CustNum").Value = "C000001" Then
    
    strItem = ""
    strItem = "select item, description, cust_item, cust_num, qty_ordered, cust_po, cust_seq, plan_code, due_date, price, lot_no" _
               & " from tmp_coitem" _
               & " order by cust_num, cust_seq, item, due_date asc"
               
    Else
               
    strItem = ""
    strItem = "select item, description, cust_item, cust_num, qty_ordered, cust_po, cust_seq, plan_code, due_date, price, lot_no" _
               & " from tmp_coitem" _
               & " order by cust_num, cust_seq, plan_code, item, due_date asc"
               
    End If
    
    
        
  

       Command.CommandText = strItem
       Set RecSet = Command.Execute
       
           
          Do While Not RecSet.EndOfResultSet
          
                ThisForm.Variables("CustNum").Value = RecSet.GetColumnValue("cust_num")
                ThisForm.Variables("item").Value = RecSet.GetColumnValue("item")
                ThisForm.Variables("custpo").Value = RecSet.GetColumnValue("cust_po")
               
                
                Call ChkCustpo
                Call ChkItemCost
                 
                
                oGrid.InsertGridRows 1, 1
                ThisForm.Components("SalesGrid").SetGridTopRow (1)
                ThisForm.Components("SalesGrid").SetGridValue 1, 1, RecSet.GetColumnValue("item")
                ThisForm.Components("SalesGrid").SetGridValue 1, 2, RecSet.GetColumnValue("description")
                ThisForm.Components("SalesGrid").SetGridValue 1, 3, RecSet.GetColumnValue("cust_item")
                ThisForm.Components("SalesGrid").SetGridValue 1, 4, RecSet.GetColumnValue("qty_ordered")
                ThisForm.Components("SalesGrid").SetGridValue 1, 5, RecSet.GetColumnValue("cust_po")
                ThisForm.Components("SalesGrid").SetGridValue 1, 6, RecSet.GetColumnValue("cust_seq")
                ThisForm.Components("SalesGrid").SetGridValue 1, 7, RecSet.GetColumnValue("plan_code")
                ThisForm.Components("SalesGrid").SetGridValue 1, 8, RecSet.GetColumnValue("due_date")
                ThisForm.Components("SalesGrid").SetGridValue 1, 9, RecSet.GetColumnValue("price")
                ThisForm.Components("SalesGrid").SetGridValue 1, 10, ThisForm.Variables("Error").Value
                ThisForm.Components("SalesGrid").SetGridValue 1, 11, ThisForm.Variables("mat_Cost").Value
                ThisForm.Components("SalesGrid").SetGridValue 1, 12, ThisForm.Variables("Lbr_Cost").Value
                ThisForm.Components("SalesGrid").SetGridValue 1, 13, ThisForm.Variables("Fovhd_Cost").Value
                ThisForm.Components("SalesGrid").SetGridValue 1, 14, ThisForm.Variables("vovhd_Cost").Value
                ThisForm.Components("SalesGrid").SetGridValue 1, 15, ThisForm.Variables("out_Cost").Value
                ThisForm.Components("SalesGrid").SetGridValue 1, 16, ThisForm.Variables("total_cost").Value
                ThisForm.Components("SalesGrid").SetGridValue 1, 17, IIf(IsNull(RecSet.GetColumnValue("lot_no")) = True, "", RecSet.GetColumnValue("lot_no"))
                
                
                i = i + 1
            
                total = total + Round(CDbl(RecSet.GetColumnValue("qty_ordered")) * CDbl(RecSet.GetColumnValue("price")), 2)
                totalcost = totalcost + Round(CDbl(ThisForm.Variables("total_cost").Value) * CDbl(RecSet.GetColumnValue("qty_ordered")), 2)
          RecSet.MoveNext
        
          
         Loop
         
         ThisForm.Variables("total").Value = total
         ThisForm.Variables("totalcost").Value = totalcost
         
         MsgBox ("Load Finish")
                 
        Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
 
End Sub

Sub Chkitem(ByVal cusitem As String, cust_num As String)

  Dim Connection As IIDOConnection
  Dim Command As IIDOCommand
  Dim RecSet As IIDORecordset
    
     Set Connection = Application.SessionManager.AppDBConnection
     Set Command = Connection.CreateCommand
 
    
    strItem = ""
     strItem = "select top 1 ic.item, i.description" _
               & " from itemcust ic" _
               & " inner join item i on i.item= ic.item " _
               & " where ic.cust_num = " & "'" & RTrim(cust_num) & "'" _
               & " and ic.cust_item = " & "'" & RTrim(cusitem) & "'"
               
               
      Command.CommandText = strItem
      Set RecSet = Command.Execute
      
      If Not RecSet.EndOfResultSet Then
               ThisForm.Variables("Item").Value = RecSet.GetColumnValue("item")
               ThisForm.Variables("Description").Value = RecSet.GetColumnValue("description")
               
            
      End If
      Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0

End Sub

Sub InsertTmpForecast()

Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset
Dim strItem As String
Dim i As Integer

   Set Connection = Application.SessionManager.AppDBConnection
   Connection.QueryTimeout = 3600
   Set Command = Connection.CreateCommand

    strItem = ""
    
    strItem = "delete From NST_Forecast_Load"
    
    Command.CommandType = idodbCmdText
    Command.CommandText = strItem
    Command.Execute
    
    i = 1
    strItem = ""
    
     For i = ThisForm.Components("SalesGrid").GetGridRowCount To 1 Step -1
        ThisForm.Components("SalesGrid").SetGridCurrentCell i, 1
          
    
    
       
       
       strItem = "insert into NST_Forecast_Load" _
               & " (yr, mth, cust_num, item, item_cust, orig_qty)" _
               & " values (" & ThisForm.Components("YrGrid").Text _
               & "," & ThisForm.Components("MthGrid").Text _
               & "," & "'" & ThisForm.Components("CustomerEdit").Text & "'" _
               & "," & "'" & ThisForm.Components("ItemGrid").Text & "'" _
               & "," & "'" & ThisForm.Components("CustItemGrid").Text & "'" _
               & "," & ThisForm.Components("QtyGrid").Text _
               & ")"
               
               
                 
          Command.CommandType = idodbCmdText
          Command.CommandText = strItem
         Command.Execute
   Next i
 
   Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
 

End Sub


Sub ForecastSplit()

Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset
Dim oParmso As IIDOParameter
Dim oParms1 As IIDOParameter

       Set Connection = Application.SessionManager.AppDBConnection
       Set Command = Connection.CreateCommand

      
       Command.CommandType = idodbCmdStoredProc
       Command.CommandText = "SP_2P2CForecastSplit"
       
       Set oParmso = Command.CreateParameter("@custnum", idodbText, idodbInput, 7, 1, ThisForm.Components("CustomerEdit").Text)
       Set oParms1 = Command.CreateParameter("@Type", idodbInteger, idodbInput, 1, 1, ThisForm.Components("cmbDate1").Text)
      
       Set RecSet = Command.Execute

    Set RecSet = Nothing
    Set Connection = Nothing
    Set Command = Nothing
    
    Application.ReturnValue = 0
    If Application.ReturnValue = 0 Then
    
       Call InsForecastGrid
       End If
   
End Sub

Sub InsForecastGrid()

Dim i As Integer
Dim iRow, iCol As Integer
Dim oGrid As Object
Dim iCurrentRow As Integer
Dim iCurrentColumn As Integer
Dim iRowCount As Integer
Dim MessageError As String
Dim Error As String
Dim strItem As String
Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset
Dim total As Double
Dim AccDesc As String
Dim Unit4 As String
Dim mFloor As String
Dim sType As String
Dim sDept As String
Dim sAccount As String
Dim sUnitcd1 As String
Dim samt As Double


    i = 1
    total = 0
    totalcost = 0
 
    Set oGrid = ThisForm.Components("ForecastGrid")
    iRowCount = oGrid.GetGridRowCount
    If iRowCount > o Then
       oGrid.DeleteGridRows 1, iRowCount
    End If
    
    ThisForm.Components("SalesGrid").GetCache.NotifyDependentsToRefresh ("")
    
    Set Connection = Application.SessionManager.AppDBConnection
    Set Command = Connection.CreateCommand
    
    
  
    
    strItem = ""
    strItem = "select item, fcst_date, orig_qty, cust_num" _
               & " from NST_Forecast_Daily" _
               & " order by item, fcst_date asc"
     
       Command.CommandText = strItem
       Set RecSet = Command.Execute
       
           
          Do While Not RecSet.EndOfResultSet
          
                
                oGrid.InsertGridRows 1, 1
                oGrid.SetGridTopRow (1)
                oGrid.SetGridValue 1, 1, RecSet.GetColumnValue("item")
                oGrid.SetGridValue 1, 2, RecSet.GetColumnValue("fcst_date")
                oGrid.SetGridValue 1, 3, RecSet.GetColumnValue("orig_qty")
                oGrid.SetGridValue 1, 4, RecSet.GetColumnValue("cust_num")
                               
                i = i + 1
            
        RecSet.MoveNext
        
          
         Loop
         
          ThisForm.Components("ForecastGrid").ForceRepaint
         MsgBox ("Load Finish")
                 
        Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
 


End Sub


Sub InsForecast()

Dim Connection As IIDOConnection
Dim Command As IIDOCommand
Dim RecSet As IIDORecordset
Dim oParms As IIDOParameter


       Set Connection = Application.SessionManager.AppDBConnection
       Connection.QueryTimeout = 3600
       Set Command = Connection.CreateCommand
        
       Command.CommandType = idodbCmdStoredProc
       Command.CommandText = "SP_2P2CInsForecast"
       
            
       Set RecSet = Command.Execute

    Set RecSet = Nothing
    Set Connection = Nothing
    Set Command = Nothing
    
    Application.ReturnValue = 0
    
    If Application.ReturnValue = 0 Then
       MsgBox ("Update Successfully")
    End If
    
    Call ClearScreen
   
End Sub

Sub PreviewKMT2()

 
  Dim TextLine$, Filename$
  Dim FileHandle As Integer
  Dim iRow, iCol As Integer

  Dim oGrid As Object
  Dim iCurrentRow As Integer
  Dim iCurrentColumn As Integer
  Dim iRowCount As Integer
  
  Dim ExcelWorksheet As Object
  Dim Connection As IIDOConnection
  Dim Command As IIDOCommand
  Dim RecSet As IIDORecordset
  Dim cust_num As String
  Dim myxl As Variant
  
 i = 1
  Filename$ = Trim(ThisForm.Components("DerDescEdit").Text)
  
  If Dir(Filename$) = "" Then Exit Sub
  
  FileHandle = FreeFile ' This is safer than assigning a number
 
  iRow = 1
  iCol = 1
  
    Set grid = ThisForm.Components("SalesGrid")
    gridcount = grid.GetGridRowCount
   
   For i = 1 To 6
        clTemp = grid.GetGridValue(0, i)
        If clTemp = "Year" Then clY = i
        If clTemp = "Month" Then clM = i
        If clTemp = "Item" Then clitem = i
        If clTemp = "Cust Item" Then clCusitem = i
        If clTemp = "Qty" Then clTotal = i
        If clTemp = "Description" Then clDesc = i
   Next i
   
   If gridcount > 0 Then
        grid.DeleteGridRows 1, gridcount
    End If
    
    
   
  Open Filename$ For Input As #FileHandle
  
            Dim j As Integer
            Dim t As String
                    
            i = 1
            j = 5
      
            Set ExcelWorksheet = GetObject(Filename$)

            If Err.Number <> 0 Then ExcelWasNotRunning = True
            Err.Clear
             
            Set myxl = GetObject(Filename$)
            
            myxl.Application.Visible = False
            myxl.Parent.Windows(1).Visible = True
            
            
            Do While Not myxl.Application.cells(i, 1).Value = "<EOF>"
                
                If i = 2 Then
                   y1 = Right(myxl.Application.cells(i, 5).Value, 4)
                   m1 = Left(myxl.Application.cells(i, 5).Value, 2)
                                 
                End If
                      
                      If i >= 3 Then
                         cusitem = myxl.Application.cells(i, 3).Value
                        Do While j < 6
                         
                       If j = 5 Then
                          m = m1
                          y = y1
                       End If
                         cust_num = ThisForm.Components("CustomerEdit").Text
                                             
                         total = myxl.Application.cells(i, j).Value
                         
                         Call Chkitem(cusitem, cust_num)
                        
                          If total <> 0 Then
                          
                          curRow = grid.GetGridRowCount + 1
                          grid.InsertGridRows curRow, 1
                          grid.SetGridValue curRow, clY, y
                          grid.SetGridValue curRow, clM, m
                          grid.SetGridValue curRow, clitem, ThisForm.Variables("Item").Value
                          grid.SetGridValue curRow, clCusitem, cusitem
                          grid.SetGridValue curRow, clTotal, total
                          grid.SetGridValue curRow, clDesc, ThisForm.Variables("description").Value
                          
                          End If
                          
                         j = j + 1
                    
                        Loop
                 
                   End If
                i = i + 1
                j = 5
                
            Loop
            
            If ExcelWasNotRunning = True Then
                myxl.Application.Quit
            End If
            Set myxl = Nothing

    
    grid.ForceRepaint
     Call InsertTmpForecast
  
Set Connection = Nothing
    Set Command = Nothing
    Application.ReturnValue = 0
           
      
 End Sub

