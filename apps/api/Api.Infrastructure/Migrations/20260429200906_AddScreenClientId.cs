using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddScreenClientId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Screens_ScreenKey",
                table: "Screens");

            migrationBuilder.AddColumn<Guid>(
                name: "ClientId",
                table: "Screens",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Screens",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Screens_ClientId",
                table: "Screens",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Screens_ScreenKey_ClientId",
                table: "Screens",
                columns: new[] { "ScreenKey", "ClientId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Screens_Clients_ClientId",
                table: "Screens",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Screens_Clients_ClientId",
                table: "Screens");

            migrationBuilder.DropIndex(
                name: "IX_Screens_ClientId",
                table: "Screens");

            migrationBuilder.DropIndex(
                name: "IX_Screens_ScreenKey_ClientId",
                table: "Screens");

            migrationBuilder.DropColumn(
                name: "ClientId",
                table: "Screens");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Screens");

            migrationBuilder.CreateIndex(
                name: "IX_Screens_ScreenKey",
                table: "Screens",
                column: "ScreenKey",
                unique: true);
        }
    }
}
