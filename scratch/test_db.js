import sequelize from '../backend/src/config/database.js';

async function test() {
  try {
    for (const table of ['staff_designation', 'leave_types']) {
      const desc = await sequelize.query(`DESCRIBE \`${table}\``, { type: sequelize.QueryTypes.SELECT });
      console.log(`\nTable Schema: ${table}`);
      console.log(desc.map(d => `${d.Field}: ${d.Type} (${d.Null}, ${d.Key})`));
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
