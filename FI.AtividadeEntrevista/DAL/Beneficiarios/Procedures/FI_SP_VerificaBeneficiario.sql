CREATE PROC FI_SP_VerificaBeneficiario
	@CPF varchar(14),
	@IdCliente bigint
AS
BEGIN
	SELECT 1 WHERE CPF = @CPF AND IDCLIENTE = @IdCliente
END