﻿CREATE PROC FI_SP_ConsBeneficiario
	@ID BIGINT
AS
BEGIN
	IF(ISNULL(@ID,0) = 0)
		SELECT * FROM BENEFICIARIOS WITH(NOLOCK)
	ELSE
		SELECT * FROM BENEFICIARIOS WITH(NOLOCK) WHERE ID = @ID
END