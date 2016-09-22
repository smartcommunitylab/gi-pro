package it.smartcommunitylab.gipro.integration;

import it.smartcommunitylab.gipro.common.Const;
import it.smartcommunitylab.gipro.model.Professional;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.GetMethod;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Node;

public class CNF {
	private static final transient Logger logger = LoggerFactory.getLogger(CNF.class);
	
	@Value("${cnf.url}")
	
	private String url;
	protected XPath xPath;
	protected DocumentBuilder documentBuilder;
	protected XPathExpression rootElement = null;
	protected XPathExpression nominativoElement = null;
	protected XPathExpression mailElement = null;
	protected XPathExpression pecElement = null;
	protected XPathExpression phoneElement = null;
	protected XPathExpression faxElement = null;
	protected XPathExpression addressElement = null;
	protected XPathExpression cfElement = null;
	
	protected XPathExpression qualificaElement = null;
	protected XPathExpression dataNascitaElement = null;
	protected XPathExpression luogoNascitaElement = null;
	protected XPathExpression ordineElement = null;
	protected XPathExpression cassazioneElement = null;
	protected XPathExpression dataIscrizioneElement = null;
			
	public CNF() {
		xPath = XPathFactory.newInstance().newXPath();
		try {
			documentBuilder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
			rootElement = this.xPath.compile("./Dettaglio");
			nominativoElement = this.xPath.compile("./nominativo");
			mailElement = this.xPath.compile("./email");
			pecElement = this.xPath.compile("./indirizzo_pec");
			phoneElement = this.xPath.compile("./tel");
			faxElement = this.xPath.compile("./fax");
			addressElement = this.xPath.compile("./indirizzo");
			cfElement = this.xPath.compile("./codice_fiscale");
			qualificaElement = this.xPath.compile("./qualifica");
			dataNascitaElement = this.xPath.compile("./data_nascita");
			luogoNascitaElement = this.xPath.compile("./luogo_nascita");
			ordineElement = this.xPath.compile("./ordine");
			cassazioneElement = this.xPath.compile("./cassaz");
			dataIscrizioneElement = this.xPath.compile("./data_iscrizione");
		} catch (Exception e) {
			logger.error("CNF:" + e.getMessage());
		}
	}
	
	public Professional getProfile(String applicationId, String cf) {
		if (StringUtils.isEmpty(url)) return new Professional();
		HttpClient httpClient = new HttpClient();
		GetMethod getMethod = new GetMethod(url + cf);
		try {
			int statusCode = httpClient.executeMethod(getMethod);
			if(logger.isInfoEnabled()) {
				logger.info("getProfile:" + statusCode);
			}
			if((statusCode >= 200) && (statusCode < 300)) {
				Document xmlDoc = this.documentBuilder.parse(getMethod.getResponseBodyAsStream());
				Node rootNode = (Node) rootElement.evaluate(xmlDoc, XPathConstants.NODE);
				String nominativo = (String) nominativoElement.evaluate(rootNode, XPathConstants.STRING);
				String mailCnf = (String) mailElement.evaluate(rootNode, XPathConstants.STRING);
				String pec = (String) pecElement.evaluate(rootNode, XPathConstants.STRING);
				String phone = (String) phoneElement.evaluate(rootNode, XPathConstants.STRING);
				String fax = (String) faxElement.evaluate(rootNode, XPathConstants.STRING);
				String address = (String) addressElement.evaluate(rootNode, XPathConstants.STRING);
				String cfCnf = (String) cfElement.evaluate(rootNode, XPathConstants.STRING);
				String qualifica = (String) qualificaElement.evaluate(rootNode, XPathConstants.STRING);
				String dataNascita = (String) dataNascitaElement.evaluate(rootNode, XPathConstants.STRING);
				String luogoNascita = (String) luogoNascitaElement.evaluate(rootNode, XPathConstants.STRING);
				String ordine = (String) ordineElement.evaluate(rootNode, XPathConstants.STRING);
				String cassazione = (String) cassazioneElement.evaluate(rootNode, XPathConstants.STRING);
				String dataIscrizione = (String) dataIscrizioneElement.evaluate(rootNode, XPathConstants.STRING);
				Professional professional = new Professional();
				professional.setApplicationId(applicationId);
				professional.setMail(mailCnf);
				professional.setPec(pec);
				professional.setPhone(phone);
				professional.setFax(fax);
				professional.setName(getName(nominativo));
				professional.setSurname(getSurname(nominativo));
				professional.setAddress(address);
				//TODO use cfCnf
				professional.setCf(cf);
				professional.setType(qualifica.trim());
				professional.getCustomProperties().put(Const.LawyerDataNascita, dataNascita);
				professional.getCustomProperties().put(Const.LawyerLuogoNascita, luogoNascita);
				professional.getCustomProperties().put(Const.LawyerOrdineCompetenza, ordine);
				professional.getCustomProperties().put(Const.LawyerDataIscrizioneOrdine, dataIscrizione);
				professional.getCustomProperties().put(Const.LawyerCassazionista, getCassazionista(cassazione));
				return professional;
			}
		} catch (Exception e) {
			logger.error("getProfile:" + e.getMessage());
		}
		return null;
	}
	
	private String getName(String nominativo) {
		int lastIndexOf = nominativo.lastIndexOf(" ");
		return nominativo.substring(lastIndexOf).trim();
	}
	
	private String getSurname(String nominativo) {
		int lastIndexOf = nominativo.lastIndexOf(" ");
		return nominativo.substring(0, lastIndexOf).trim();
	}
	
	private boolean getCassazionista(String cassazione) {
		return cassazione.equalsIgnoreCase("SI");
	}
	
}
