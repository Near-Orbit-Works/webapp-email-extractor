const fileInputs = document.querySelectorAll('input[type="file"]');
const fileNameDisplays = document.querySelectorAll('.filename');

const mergeBtn = document.getElementById('mergeBtn');
const resetBtn = document.getElementById('resetBtn');
const statusMessage = document.getElementById('statusMessage');
const downloadBtn = document.getElementById('downloadBtn');


// -----------------------------
// Display selected filenames
// -----------------------------
fileInputs.forEach((input, index) => {
    input.addEventListener("change", function () {
        const file = input.files[0];

        if (!file) {
            fileNameDisplays[index].textContent = "No file selected";
            return;
        }

        // Validate file type
        if (!file.name.toLowerCase().endsWith(".csv")) {
            fileNameDisplays[index].textContent = "Invalid file type";
            input.value = "";

            updateStatus(
                "⚠️ Only CSV files are allowed.\nPlease export directly from Salesforce.",
                "error"
            );
            return;
        }

        fileNameDisplays[index].textContent = file.name;

        updateStatus(
            "✅ File uploaded successfully.\nReady for additional files or processing.",
            "success"
        );
    });
});


// -----------------------------
// Merge button
// -----------------------------
mergeBtn.addEventListener("click", async function () {
    const uploadedFiles = [...fileInputs]
        .map(input => input.files[0])
        .filter(file => file);

    if (uploadedFiles.length === 0) {
        updateStatus(
            "⚠️ Please upload at least one CSV file before merging.",
            "error"
        );
        return;
    }

    try {
        let allEmails = [];

        for (const file of uploadedFiles) {
            const emails = await extractEmailsFromFile(file);
            allEmails = allEmails.concat(emails);
        }

        const cleanedEmails = [...new Set(
            allEmails.map(email => email.trim().toLowerCase())
        )]
        .sort();

        const batchSize = 490;
        const numBatches = Math.ceil(cleanedEmails.length / batchSize);

        updateStatus(
            `✅ Email merge complete.\n\n` +
            `${cleanedEmails.length} unique email addresses extracted\n` +
            `with ${numBatches} send-ready batches created`,
            "success"
        );

        const csvContent = generateBatchCSV(cleanedEmails, batchSize);

        downloadCSV(csvContent);

        console.log("Final cleaned emails:", cleanedEmails);
        console.log("Extracted emails:", allEmails);

    } catch (error) {
        updateStatus(
            `⚠️ Error: ${error.message}`,
            "error"
        );
    }
});


// -----------------------------
// Reset everything
// -----------------------------
resetBtn.addEventListener("click", function () {

    fileInputs.forEach((input, index) => {
        input.value = "";
        fileNameDisplays[index].textContent = "No file selected";
    });

    downloadBtn.hidden = true;

    updateStatus(
        "🔄 Form reset successfully.\nReady for new files.",
        "neutral"
    );
});

// -----------------------------
// Extract emails from a single CSV file using PapaParse
// -----------------------------
function extractEmailsFromFile(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,

            complete: function(results) {
                try {
                    const data = results.data;

                    if (!data || data.length === 0) {
                        reject(new Error(`${file.name} appears to be empty.`));
                        return;
                    }

                    const headers = Object.keys(data[0]);

                    const emailColumn = headers.find(header =>
                        header.toLowerCase().includes("email")
                    );

                    if (!emailColumn) {
                        reject(
                            new Error(
                                `${file.name} does not contain a valid email column.`
                            )
                        );
                        return;
                    }

                    const emails = data
                        .map(row => row[emailColumn])
                        .filter(email => email && email.trim() !== "")
                        .map(email => email.trim());

                    resolve(emails);

                } catch (err) {
                    reject(err);
                }
            },

            error: function(err) {
                reject(err);
            }
        });
    });
}

// -----------------------------
// Generate batch CSV content
// -----------------------------
function generateBatchCSV(emails, batchSize) {
    const numBatches = Math.ceil(emails.length / batchSize);
    const columns = [];

    // Create column arrays
    for (let i = 0; i < numBatches; i++) {
        const start = i * batchSize;
        const end = start + batchSize;
        columns.push(emails.slice(start, end));
    }

    const maxRows = Math.max(...columns.map(col => col.length));
    let csvRows = [];

    // Build rows WITHOUT headers
    for (let row = 0; row < maxRows; row++) {
        let rowData = [];

        for (let col = 0; col < columns.length; col++) {
            rowData.push(columns[col][row] || "");
        }

        csvRows.push(rowData.join(","));
    }

    return csvRows.join("\n");
}

// -----------------------------
// Download CSV file
// -----------------------------
function downloadCSV(csvContent) {
    const today = new Date().toISOString().split("T")[0];
    const fileName = `merged_emails_${today}.csv`;

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show fallback button just in case
    downloadBtn.hidden = false;

    downloadBtn.onclick = function () {
        const fallbackLink = document.createElement("a");
        fallbackLink.href = url;
        fallbackLink.download = fileName;
        fallbackLink.click();
    };
}


// -----------------------------
// Status helper
// -----------------------------
function updateStatus(message, type) {
    statusMessage.textContent = message;

    if (type === "error") {
        statusMessage.style.backgroundColor = "#5c0000";
        statusMessage.style.color = "#ffb3b3";
    }

    else if (type === "success") {
        statusMessage.style.backgroundColor = "#003b00";
        statusMessage.style.color = "#90ee90";
    }

    else {
        statusMessage.style.backgroundColor = "black";
        statusMessage.style.color = "lime";
    }
}