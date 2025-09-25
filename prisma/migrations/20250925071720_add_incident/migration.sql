BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Incident] (
    [id] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Incident_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [reporterId] NVARCHAR(1000) NOT NULL,
    [site] NVARCHAR(1000) NOT NULL,
    [occurredAt] DATETIME2 NOT NULL,
    [incidentArea] NVARCHAR(1000) NOT NULL,
    [incidentCategory] NVARCHAR(1000) NOT NULL,
    [shift] NVARCHAR(1000) NOT NULL,
    [severity] NVARCHAR(1000) NOT NULL,
    [personnelType] NVARCHAR(1000) NOT NULL,
    [injuryArea] NVARCHAR(1000) NOT NULL,
    [operationalCategory] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [riskScore] INT,
    CONSTRAINT [Incident_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Incident] ADD CONSTRAINT [Incident_reporterId_fkey] FOREIGN KEY ([reporterId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
