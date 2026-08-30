const inventory = [
  { type: "Road", name: "2025 City 300", meta: "In stock · Enquire", colour: "visual-bike-orange" },
  { type: "Adventure", name: "Trail 500 X", meta: "Demo available", colour: "visual-bike-green" },
  { type: "Electric", name: "Urban E2", meta: "From $6,490", colour: "visual-bike-blue" },
];

export function DealerSystemVisual() {
  return (
    <div className="system-visual" aria-label="Illustration of a modern dealer website and admin system">
      <div className="browser-bar">
        <span /><span /><span />
        <div className="browser-address">yourdealership.com.au</div>
      </div>
      <div className="visual-body">
        <aside className="visual-sidebar">
          <div className="visual-logo">YOUR<br />DEALER</div>
          <span className="visual-active">Inventory</span>
          <span>Parts</span>
          <span>Service</span>
          <span>Enquiries</span>
        </aside>
        <div className="visual-content">
          <div className="visual-heading">
            <div><small>LIVE INVENTORY</small><strong>Find your next machine.</strong></div>
            <button>Filter stock</button>
          </div>
          <div className="visual-cards">
            {inventory.map((item) => (
              <div className="visual-card" key={item.name}>
                <div className={`visual-bike ${item.colour}`}><span /></div>
                <small>{item.type}</small>
                <strong>{item.name}</strong>
                <p>{item.meta}</p>
              </div>
            ))}
          </div>
          <div className="visual-status">
            <div><span className="status-pulse" />New parts enquiry</div>
            <div><b>Assigned</b> Parts desk</div>
            <div><b>Next</b> Customer update</div>
          </div>
        </div>
      </div>
    </div>
  );
}

