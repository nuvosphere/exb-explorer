"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("exbs", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      txHash: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      blockNumber: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      sender: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      recipient: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      from1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tick1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amt1: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      from2: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tick2: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amt2: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      comms: {
        type: Sequelize.JSON,
      },
      dataRaw: {
        type: Sequelize.JSON,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("exbs");
  }
};

