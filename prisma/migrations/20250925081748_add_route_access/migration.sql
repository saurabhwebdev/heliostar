BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[RouteAccess] (
    [id] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RouteAccess_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [userId] NVARCHAR(1000) NOT NULL,
    [path] NVARCHAR(1000) NOT NULL,
    [isPrefix] BIT NOT NULL CONSTRAINT [RouteAccess_isPrefix_df] DEFAULT 1,
    CONSTRAINT [RouteAccess_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RouteAccess_userId_path_key] UNIQUE NONCLUSTERED ([userId],[path])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [RouteAccess_userId_idx] ON [dbo].[RouteAccess]([userId]);

-- AddForeignKey
ALTER TABLE [dbo].[RouteAccess] ADD CONSTRAINT [RouteAccess_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
