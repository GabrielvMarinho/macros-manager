import { Button } from "antd";

function getFirstDayOfWeek(date) {
  const firstDay = new Date(date);
  const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  firstDay.setDate(firstDay.getDate() - dayOfWeek);
  firstDay.setHours(0, 0, 0, 0); // reset hour/minute/second/millisecond
  return firstDay;
}

export default function ({ history, api }) {

  const today = new Date();
    const dayToday = today.getDate();
    const monthToday = today.getMonth();
    const yearToday = today.getFullYear().toString().split("").slice(-2).join("");
    const firstDayOfWeek = getFirstDayOfWeek(today);

    const executedToday = [];
    const executedThisWeek = [];
    const executedOlder = [];

    for (let record of history) {
      
      const dateStr = record["time"].split(" - ")[0];
      const [day, month, year] = dateStr.split("/").map(Number);
      const specificDate = new Date(`20${year}`, month-1, day)
    if (
        day == dayToday &&
        month == monthToday+1 &&
        year == yearToday
    ) {
        executedToday.push(record);
    } else if (specificDate >= firstDayOfWeek) {
        executedThisWeek.push(record);
    } else {
        executedOlder.push(record);
    }
    }

  function renderSection(title, items) {
    return (
      <>
        {items.length > 0 && (
          <>
            <tr className="mainTableRowHistory sectionHeader">
              <td colSpan={3}><strong>{title}</strong></td>
            </tr>
            {items.map((h, i) => (
              <tr className="mainTableRowHistory"   key={`${title}-${i}`}>
                <td>{h["id"]}</td>
                <td>{h["name"]}</td>
                <td>{h["time"]}</td>
                {h["has_output"]?
                  <Button className="buttonVisualizeExcel" onClick={() =>api.open_macro_output(h["id"])}>visualizar</Button>
                :""
                }

              </tr>
            ))}
          </>
        )}
      </>
    );
  }

  return (
    <table className="historyTable">
      <thead>
        <tr className="mainTableRowHistoryHeader">
          <th>Id</th>
          <th>Nome</th>
          <th>Conclusão</th>
        </tr>
      </thead>
      <tbody className="bodyHistory">
        {renderSection("Executados Hoje", executedToday)}
        {renderSection("Executados Esta Semana", executedThisWeek)}
        {renderSection("Executados Anteriormente", executedOlder)}
      </tbody>
    </table>
  );
}