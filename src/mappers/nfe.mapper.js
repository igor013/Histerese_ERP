// src/mappers/nfe.mapper.js

function onlyDigits(s) {
    return (s || "").replace(/\D+/g, "");
}

module.exports = {
    map(nfe) {
        const inf = nfe.infNFe;
        const ide = inf.ide || {};
        const emit = inf.emit || {};
        const dest = inf.dest || {};
        const total = inf.total?.ICMSTot || {};

        const chaveAcesso = onlyDigits((inf["@_Id"] || "").replace("NFe", ""));
        const modelo = String(ide.mod || "");
        const serie = String(ide.serie || "");
        const numero = String(ide.nNF || "");
        const dataEmissao = ide.dhEmi || ide.dEmi || null;

        // Por enquanto assumimos que toda NF importada é de entrada (compra)
        const direction = "entrada";

        const emitente = {
            cnpj: onlyDigits(emit.CNPJ),
            nome: emit.xNome || null,
            ie: emit.IE || null,
        };

        const destinatario = {
            cnpj: onlyDigits(dest.CNPJ),
            cpf: onlyDigits(dest.CPF),
            nome: dest.xNome || null,
            ie: dest.IE || null,
        };

        // Itens (det pode ser array ou objeto único)
        let det = inf.det || [];
        if (!Array.isArray(det)) det = [det];

        const itens = det.map((d) => {
            const prod = d.prod || {};
            return {
                codigo: String(prod.cProd || ""),
                ean: String(prod.cEAN || ""),
                descricao: prod.xProd || "",
                ncm: String(prod.NCM || ""),
                cest: prod.CEST ? String(prod.CEST) : null,
                cfop: String(prod.CFOP || ""),
                uCom: prod.uCom || "",
                qCom: Number(prod.qCom || 0),
                vUnCom: Number(prod.vUnCom || 0),
                vProd: Number(prod.vProd || 0),
                vDesc: prod.vDesc ? Number(prod.vDesc) : 0,
            };
        });

        const totalNF = Number(total.vNF || inf.total?.ICMSTot?.vProd || 0);

        return {
            chaveAcesso,
            modelo,
            serie,
            numero,
            dataEmissao,
            direction,
            emitente,
            destinatario,
            itens,
            totalNF,
        };
    },
};
