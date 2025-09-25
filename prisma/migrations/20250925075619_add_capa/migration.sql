BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Capa] (
    [id] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Capa_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [incidentId] NVARCHAR(1000) NOT NULL,
    [assignedToId] NVARCHAR(1000),
    [site] NVARCHAR(1000) NOT NULL,
    [occurredAt] DATETIME2 NOT NULL,
    [incidentArea] NVARCHAR(1000) NOT NULL,
    [incidentCategory] NVARCHAR(1000) NOT NULL,
    [shift] NVARCHAR(1000) NOT NULL,
    [severity] NVARCHAR(1000) NOT NULL,
    [personnelType] NVARCHAR(1000) NOT NULL,
    [operationalCategory] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [actionTaken] NVARCHAR(1000) NOT NULL,
    [costAmount] FLOAT(53),
    [costCurrency] NVARCHAR(1000),
    CONSTRAINT [Capa_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Capa] ADD CONSTRAINT [Capa_incidentId_fkey] FOREIGN KEY ([incidentId]) REFERENCES [dbo].[Incident]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Capa] ADD CONSTRAINT [Capa_assignedToId_fkey] FOREIGN KEY ([assignedToId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
