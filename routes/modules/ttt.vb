SET QUOTED_IDENTIFIER ON 
GO
SET ANSI_NULLS ON 
GO


ALTER  PROC [dbo].[PPCC_EDI_InsertTmpDataSp](
  @SessionID	RowPointerType
, @Err			NVARCHAR(255)
, @Msg			NVARCHAR(255)
, @CustNum		CustNumType
, @Item			ItemType
, @Desc			DescriptionType
, @CustItem		CustItemType
, @Qty			QtyUnitNoNegType
, @FcstDate		DateType
, @FileName		NVARCHAR(255)
, @Username		UsernameType
, @CntPreview	SMALLINT
, @Format		NVARCHAR(255)
, @Txt01		NVARCHAR(255)
)
AS

SELECT @Username = Username FROM usernames WHERE Username = @Username

DECLARE
  @CurMMYY		INT
, @FcstMMYY		INT
, @Rank			INT

BEGIN TRAN
	SET @CurMMYY = CONVERT(INT, CONVERT(NVARCHAR, YEAR(GETDATE())) + RIGHT('00' + CONVERT(NVARCHAR, MONTH(GETDATE())),2))
	SET @FcstMMYY = CONVERT(INT, CONVERT(NVARCHAR, YEAR(@FcstDate)) + RIGHT('00' + CONVERT(NVARCHAR, MONTH(@FcstDate)),2))

	---------------------------------------------------------- GetData
	SELECT TOP 1 
	@Item = ic.item, @Desc = i.description, @CustNum = ic.cust_num, @Rank = ic.rank
	FROM itemcust ic INNER JOIN item i ON ic.item = i.item
	WHERE ic.cust_item = @CustItem ORDER BY ic.rank, ic.item, ic.cust_num ASC

	IF @Format = 'HAPC' AND @Rank <> 1
	BEGIN
		IF EXISTS(SELECT 1 FROM itemcust WHERE item = @Item AND rank = 1)
		BEGIN
			SELECT @Item = ic.item, @Desc = i.description, @CustNum = ic.cust_num
			FROM itemcust ic INNER JOIN item i ON ic.item = i.item
			WHERE ic.item = @Item AND rank = 1
		END
	END


	---------------------------------------------------------- Check CustItem
	IF ISNULL(@CustNum,'') = ''
		SET @Err = CASE WHEN ISNULL(@Err,'') <> '' THEN @Err + ', Customer Item. is invalid' ELSE 'Customer Item. is invalid' END

	
	---------------------------------------------------------- Warning!! Month N
	IF @FcstMMYY <= @CurMMYY
		SET @Msg = CASE WHEN ISNULL(@Msg,'') <> '' THEN @Msg + ', Warning!! Tansaction Month N' ELSE 'Warning!! Tansaction Month N' END


	---------------------------------------------------------- Check Less than Current Date
	IF DATEDIFF(D, GETDATE(), @FcstDate) < 0
		SET @Err = CASE WHEN ISNULL(@Err,'') <> '' THEN @Err + ', Forecast Date can not less than Current Date'
													ELSE 'Forecast Date can not less than Current Date' END


	---------------------------------------------------------- Check Dupicate FileName
	IF EXISTS(SELECT 1 FROM ppcc_edi_tmp WHERE SessionID = @SessionID AND filename = @FileName AND count_preview <> @CntPreview)
		SET @Err = CASE WHEN ISNULL(@Err,'') <> '' THEN @Err + ', This file was load already' ELSE 'This file was load already' END


	---------------------------------------------------------- Insert Temp
	SET @Err = CASE WHEN @Err = '' THEN NULL ELSE @Err END
	SET @Msg = CASE WHEN @Msg = '' THEN NULL ELSE @Msg END

	INSERT INTO ppcc_edi_tmp(SessionID, err, msg, cust_num, item, desctiprion, cust_item
							, qty, fcst_date, filename, count_preview, CreatedBy, UpdatedBy, cust_format, txt01)
	VALUES(@SessionID, @Err, @Msg, @CustNum, @Item, @Desc, @CustItem, @Qty, @FcstDate
			, @FileName, @CntPreview, @Username, @Username, @Format, @Txt01)

COMMIT TRAN

GO
SET QUOTED_IDENTIFIER OFF 
GO
SET ANSI_NULLS ON 
GO

