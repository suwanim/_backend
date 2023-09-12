Sub OpenGetFile()
    On Error GoTo OpenGetFileErr
    GetFile.Filter = "All iles (*.*)|*.*"
    GetFile.Flags = cdlOFNHideReadOnly
    GetFile.DialogTitle = Application.GetStringValue("sA&ttach File...")
    GetFile.ShowOpen
    GetFile.CancelError = False
    
    If GetFile.FileName <> "" Then
        ThisForm.Variables("vAttachment").Value = GetFile.FileName
    End If
    
    Exit Sub
    
OpenGetFileErr:
    If Err.Number <> cdlCancel Then
    Application.ShowMessage Err.Description
    End If
End Sub

Sub Process(ByVal PathFile As String, ByVal Process As String)
    Dim Format, SessionID, UserID As String
    SessionID = ThisForm.Variables("SessionID").Value
    UserID = ThisForm.Variables("UserID").Value
    
    If Trim(PathFile) <> "" Then
        If Process = "P" Then
            Format = CheckFormat(PathFile)
            If Format = "HAPC" Then
                Call PreviewHAPC(PathFile, SessionID, UserID)
            ElseIf Format = "IMCT" Then
                Call PreviewIMCT(PathFile, SessionID, UserID)
            ElseIf Format = "BOSCH" Then
                Call PreviewBOSCH(PathFile, SessionID, UserID)
            Else
                MsgBox "Invalid file format. Please check the Attached File"
                Exit Sub
            End If

            ThisForm.Variables("vCountPreview").Value = CInt(ThisForm.Variables("vCountPreview").Value) + 1
            Call ShowTmpData(SessionID)
            Call GetReturnError(SessionID)
        ElseIf Process = "B" Then
            Call Combine(SessionID, UserID)
        ElseIf Process = "C" Then
            Call Commit(SessionID, UserID)
        Else
            MsgBox "Please select Activity to process"
            Exit Sub
        End If
    Else
        MsgBox "Please select filename for Import data", vbCritical
        Exit Sub
    End If
    
End Sub

Function CheckFormat(ByVal PathFile As String) As String
    On Error GoTo CheckFormatErr
    
    Dim Linetxt, Comma0, Comma1, Tab0, Tab1 As String
    Dim ColTxt() As String

    Open Trim(PathFile) For Input As #1
        Line Input #1, Linetxt

'        ColTxt = Split(Replace(Linetxt, ",", vbTab), vbTab)
'        Comma0 = ColTxt(0)
'        Comma1 = ColTxt(1)

        ColTxt = Split(Linetxt, vbTab)
        Tab0 = ColTxt(0)
        Tab1 = ColTxt(1)
    Close #1

    If Comma0 = "5211" Or Tab0 = "5211" Then
        CheckFormat = "HAPC"
    ElseIf Comma1 = "NST" Or Tab1 = "NST" Then
        CheckFormat = "IMCT"
    Else 'If Comma1 = "97939899" Or Tab1 = "97939899" Then
        CheckFormat = "BOSCH"
'    Else
'        CheckFormat = ""
    End If
    
CheckFormatErr:
    If Err.Number <> 0 Then Close #1
End Function

Sub InsertTmpFC(ByVal SessionID As String, ByVal Err As String, ByVal Msg As String, ByVal CustNum As String, ByVal Item As String _
                , ByVal Desc As String, ByVal CustItem As String, ByVal Qty As String, ByVal FcstDate As String _
                , ByVal FileName As String, ByVal UserID As String, ByVal Format As String, ByVal Txt01 As String)
    Dim Connection As IIDOConnection, Command As IIDOCommand
    Dim RecSet As IIDORecordset
    Dim strItem As String

    Set Connection = Application.SessionManager.AppDBConnection
    Set Command = Connection.CreateCommand

    strItem = "EXEC PPCC_EDI_InsertTmpDataSp" _
            & " '" & SessionID & "'" _
            & ", '" & Err & "'" _
            & ", '" & Msg & "'" _
            & ", '" & CustNum & "'" _
            & ", '" & Item & "'" _
            & ", '" & Desc & "'" _
            & ", '" & CustItem & "'" _
            & ", " & Qty & "" _
            & ", '" & FcstDate & "'" _
            & ", '" & FileName & "'" _
            & ", '" & UserID & "'" _
            & ", " & ThisForm.Variables("vCountPreview").Value & "" _
            & ", '" & Format & "'" _
            & ", '" & Txt01 & "'"

    Command.CommandText = strItem
    Set RecSet = Command.Execute

    Set Connection = Nothing
    Set Command = Nothing
End Sub

Sub PreviewIMCT(ByVal PathFile As String, ByVal SessionID As String, ByVal UserID As String)
    Dim TextLine$, FileName$
    Dim i, Week, FileHandle As Integer
    Dim curRow, colWeek, LastWeek As Integer
    Dim Linetxt, ColTxt() As String

    curRow = 0
    FileName$ = Trim(PathFile)
    If Dir(FileName$) = "" Then Exit Sub
  
    FileHandle = FreeFile

    Open FileName$ For Input As #FileHandle
        While Not EOF(FileHandle)
            Dim Err, Msg, CustNum, CustItem, Item, ItemDesc, Qty, FcstDate, FileLoad As String
            Line Input #FileHandle, Linetxt

'            ColTxt = Split(Replace(Linetxt, ",", ""), vbTab)
            ColTxt = Split(Linetxt, vbTab)
        
            Qty = "0"
            Err = ""
            If ColTxt(1) <> "NST" Then Msg = "File does not Supplier NST"
            
            CustItem = ColTxt(6)
            FileLoad = ColTxt(116)
            
            For Week = 1 To 7
                Select Case Week
                    Case 1: colWeek = 14  '----N Week 1
                    Case 2: colWeek = 28  '----N Week 2
                    Case 3: colWeek = 42  '----N Week 3
                    Case 4: colWeek = 56  '----N Week 4
                    Case 5: colWeek = 70  '----N+1 Week 1
                    Case 6: colWeek = 84  '----N+1 Week 2
                    Case 7: colWeek = 97  '----N+1 Week 3-4
                End Select
                
                Msg = ""
                If Week = 7 Then
                    LastWeek = 1
                Else
                    LastWeek = 0
                End If
                
                For i = 0 To 5 + LastWeek
                    Qty = "0"
                    FcstDate = ""
                    Qty = ColTxt(colWeek + (6 + LastWeek) + i)
                    FcstDate = ColTxt(colWeek + i)

                    If Qty <> "0" And Len(FcstDate) > 0 Then
                        Call InsertTmpFC(SessionID, Err, Msg, CustNum, Item, ItemDesc, CustItem, Qty, FcstDate, FileLoad, UserID, "IMCT", "")
                    End If
                Next
                
            Next
            
        Wend
        
    Close #FileHandle
End Sub

	การหยิบค่า
		week = 7 หยิบข้อมูล 7 วัน (0-6)
		qty <> 0 and date <> ''




Sub PreviewHAPC(ByVal PathFile As String, ByVal SessionID As String, ByVal UserID As String)
    Dim TextLine$, FileName$
    Dim i, Month, FileHandle, Total As Integer
    Dim curRow, colMonth As Integer
    Dim Linetxt, ColTxt() As String

    curRow = 0
    FileName$ = Trim(PathFile)
    If Dir(FileName$) = "" Then Exit Sub
  
    FileHandle = FreeFile

    Open FileName$ For Input As #FileHandle
        While Not EOF(FileHandle)
            Dim Err, Msg, CustNum, CustItem, Item, ItemDesc, Qty, FcstDate As String
            Line Input #FileHandle, Linetxt
            ColTxt = Split(Linetxt, vbTab)
'            ColTxt = Split(Replace(Linetxt, ",", ""), vbTab)
            Month = 0
            
            Qty = "0"
            Err = ""
            If ColTxt(0) <> "5211" Then Msg = "File does not Supplier NST"
            
            CustItem = ColTxt(2)
            
            For i = 0 To 20
                FcstDate = ColTxt(4 + Month) & "01"
                If Len(FcstDate) <> 8 Then
                    Total = i
                    Exit For
                End If

                Month = Month + 2
            Next
            
            Month = 0
            For i = 0 To Total - 1
'                Qty = "0"
'                FcstDate = ""
                Qty = ColTxt(4 + Month + 1)
                FcstDate = ColTxt(4 + Month) & "01"

'                If Qty <> "0" And Len(FcstDate) > 0 Then
                    Call InsertTmpFC(SessionID, Err, Msg, CustNum, Item, ItemDesc, CustItem, Qty, FcstDate, FileName$, UserID, "HAPC", "")
'                End If

                Month = Month + 2
            Next
        Wend
    Close #FileHandle
End Sub

Sub PreviewBOSCH(ByVal PathFile As String, ByVal SessionID As String, ByVal UserID As String)
    Dim TextLine$, FileName$
    Dim i, Month, FileHandle As Integer
    Dim curRow, colMonth As Integer
    Dim Linetxt, ColTxt() As String

    curRow = 0
    FileName$ = Trim(PathFile)
    If Dir(FileName$) = "" Then Exit Sub
  
    FileHandle = FreeFile

    Open FileName$ For Input As #FileHandle
        While Not EOF(FileHandle)
            Dim Err, Msg, CustNum, CustItem, Item, ItemDesc, Qty, FcstDate, Plant As String
            Line Input #FileHandle, Linetxt
            curRow = curRow + 1

            If curRow > 1 Then
                ColTxt = Split(Linetxt, vbTab)
'                ColTxt = Split(Replace(Linetxt, ",", ""), vbTab)
                Month = 0
    
                Qty = "0"
                Err = ""
                If ColTxt(1) <> "97939899" Then Msg = "File does not Supplier NST"

                CustItem = ColTxt(18)
                Qty = ColTxt(37)
                FcstDate = Format(Replace(ColTxt(36), ".", "-"), "yyyy-MM-dd")
                Plant = ColTxt(7)

                If Qty <> "0" And Len(FcstDate) > 0 Then
                    Call InsertTmpFC(SessionID, Err, Msg, CustNum, Item, ItemDesc, CustItem, Qty, FcstDate, FileName$, UserID, "BOSCH", Plant)
                End If
            End If
        Wend
    Close #FileHandle
End Sub

Sub ClearData(ByVal SessionID As String)
    Dim Connection As IIDOConnection, Command As IIDOCommand
    Dim RecSet As IIDORecordset
    Dim strItem As String
    Dim LGrid, RGrid As Object
    Dim iRowCount As Integer
    
    Set LGrid = ThisForm.Components("DataGrid")
    Set RGrid = ThisForm.Components("FcstGrid")
    If LGrid.GetGridRowCount > 0 Then LGrid.DeleteGridRows 1, LGrid.GetGridRowCount
    If RGrid.GetGridRowCount > 0 Then RGrid.DeleteGridRows 1, RGrid.GetGridRowCount

    
    ThisForm.Variables("PProcess").Value = "P"
    ThisForm.Variables("vCountPreview").Value = 0
'    ThisForm.Variables("vAttachment").Value = ""
    ThisForm.Variables("vReturnError").Value = 0

    Set Connection = Application.SessionManager.AppDBConnection
    Set Command = Connection.CreateCommand
    
    strItem = "delete ppcc_edi_tmp where SessionID = '" & SessionID & "'" _
            & " delete ppcc_edi_forecast where SessionID = '" & SessionID & "'"

    Command.CommandText = strItem
    Set RecSet = Command.Execute
    
    LGrid.ForceRepaint
    RGrid.ForceRepaint
    Set Connection = Nothing
    Set Command = Nothing
End Sub

Sub ShowTmpData(ByVal SessionID As String)
    Dim Connection As IIDOConnection, Command As IIDOCommand
    Dim RecSet As IIDORecordset
    Dim strItem As String
    Dim Grid As Object
    Dim iRowCount As Integer
    
    Set Grid = ThisForm.Components("DataGrid")
    iRowCount = Grid.GetGridRowCount
    If iRowCount > 0 Then
       Grid.DeleteGridRows 1, iRowCount
    End If
    
    Set Connection = Application.SessionManager.AppDBConnection
    Set Command = Connection.CreateCommand
    
    strItem = "select isnull(err,'') err, isnull(msg,'') msg, cust_num, item, desctiprion, cust_item" _
            & ", qty, fcst_date, filename from ppcc_edi_tmp" _
            & " where SessionID = '" & SessionID & "' order by CreateDate desc"

    Command.CommandText = strItem
    Set RecSet = Command.Execute
    
    Do While Not RecSet.EndOfResultSet
        Grid.InsertGridRows 1, 1
        Grid.SetGridValue 1, 1, RecSet.GetColumnValue("err")
        Grid.SetGridValue 1, 2, RecSet.GetColumnValue("msg")
        Grid.SetGridValue 1, 3, RecSet.GetColumnValue("cust_num")
        Grid.SetGridValue 1, 4, RecSet.GetColumnValue("item")
        Grid.SetGridValue 1, 5, RecSet.GetColumnValue("desctiprion")
        Grid.SetGridValue 1, 6, RecSet.GetColumnValue("cust_item")
        Grid.SetGridValue 1, 7, RecSet.GetColumnValue("qty")
        Grid.SetGridValue 1, 8, RecSet.GetColumnValue("fcst_date")
        Grid.SetGridValue 1, 9, RecSet.GetColumnValue("filename")
        
        RecSet.MoveNext
    Loop
    
    Grid.ForceRepaint
    Set Connection = Nothing
    Set Command = Nothing
End Sub

Sub Combine(ByVal SessionID As String, ByVal UserID As String)
    If ThisForm.Variables("vReturnError").Value = "1" Then
        MsgBox ("Can't Combine Data, Please recheck format file")
        Exit Sub
    End If
    
    Dim Connection As IIDOConnection, Command As IIDOCommand
    Dim RecSet As IIDORecordset
    Dim strItem As String
    Dim Grid As Object
    
    Set Grid = ThisForm.Components("FcstGrid")
    If Grid.GetGridRowCount > 0 Then Grid.DeleteGridRows 1, Grid.GetGridRowCount
    
    Set Connection = Application.SessionManager.AppDBConnection
    Set Command = Connection.CreateCommand
    
    strItem = "EXEC PPCC_EDI_CombineDataSp '" & SessionID & "', '" & UserID & "'"
            
    Command.CommandText = strItem
    Command.Execute
    
    '------------------------------------------------------ ShowOnGrid
    strItem = ""
    strItem = "select cust_num, item, qty, fcst_date from ppcc_edi_forecast" _
            & " where SessionID = '" & SessionID & "' order by cust_num, item, fcst_date desc"

    Command.CommandText = strItem
    Set RecSet = Command.Execute

    Do While Not RecSet.EndOfResultSet
        Grid.InsertGridRows 1, 1
        Grid.SetGridValue 1, 1, RecSet.GetColumnValue("cust_num")
        Grid.SetGridValue 1, 2, RecSet.GetColumnValue("item")
        Grid.SetGridValue 1, 3, RecSet.GetColumnValue("qty")
        Grid.SetGridValue 1, 4, RecSet.GetColumnValue("fcst_date")
        
        RecSet.MoveNext
    Loop
    
    Grid.ForceRepaint
    Set Connection = Nothing
    Set Command = Nothing
End Sub

Sub Commit(ByVal SessionID As String, ByVal UserID As String)
    If ThisForm.Variables("vReturnError").Value = "1" Then Exit Sub
    
    Dim Connection As IIDOConnection, Command As IIDOCommand
    Dim RecSet As IIDORecordset
    Dim strItem As String
    
    Set Connection = Application.SessionManager.AppDBConnection
    Connection.QueryTimeout = 3600
    Set Command = Connection.CreateCommand
    
    strItem = "EXEC PPCC_EDI_ProcessDataSp" _
            & " '" & SessionID & "'" _
            & ", '" & UserID & "'"
            
    Command.CommandText = strItem
    Command.Execute

    
    If Command.ReturnValue = 0 Then
        MsgBox ("Update Successfully")
        Set Connection = Nothing
        Set Command = Nothing
    
        Call ClearData(SessionID)
    End If
End Sub


Sub GetReturnError(ByVal SessionID As String)
    Dim Connection As IIDOConnection, Command As IIDOCommand
    Dim RecSet As IIDORecordset
    Dim strItem, ReturnErr As String
    
    Set Connection = Application.SessionManager.AppDBConnection
    Set Command = Connection.CreateCommand
    
    strItem = "select top 1 err from ppcc_edi_tmp where isnull(err,'') <> ''" _
            & " and SessionID = '" & SessionID & "'"

    Command.CommandText = strItem
    Set RecSet = Command.Execute
    ReturnErr = RecSet.GetColumnValue("err")
    
    If ReturnErr = "" Then
        ThisForm.Variables("vReturnError").Value = 0
    Else
        ThisForm.Variables("vReturnError").Value = 1
    End If

    Set Connection = Nothing
    Set Command = Nothing
End Sub

