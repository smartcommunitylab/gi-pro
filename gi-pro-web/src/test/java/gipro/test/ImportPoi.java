package gipro.test;

import it.smartcommunitylab.gipro.common.Const;
import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.model.Poi;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.FilenameFilter;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.csv.QuoteMode;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.junit.Before;
import org.junit.Test;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.google.common.collect.Lists;

public class ImportPoi {
	public static String path = "C:\\Users\\micnori\\Documents\\Progetti\\gi-pro\\xml";
	public static String applicatinID = "DEMO";
	public static String accessToken = "???";
	//public static String importUrl = "http://localhost:8080/gi-pro/import/ADMIN/poi/";
	public static String importUrl = "https://dev.smartcommunitylab.it/gi-pro/import/ADMIN/poi/";
	
	public static final String[] FILE_HEADER = {"type", "name", "region", "address", "description"};
	
	protected XPath xPath;
	protected DocumentBuilder documentBuilder;
	
	@Before
	public void setup() throws ParserConfigurationException {
		this.xPath = XPathFactory.newInstance().newXPath();
		this.documentBuilder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
	}
	
	@Test
	public void XMLToCSV() throws Exception {
		XPathExpression rootElement = this.xPath.compile("./root");
		XPathExpression ufficioElement = this.xPath.compile("./ufficio");
		XPathExpression nameElement = this.xPath.compile("./@nomeufficio");
		XPathExpression addressElement = this.xPath.compile("./indirizzo");
		XPathExpression capElement = this.xPath.compile("./cap");
		XPathExpression comuneElement = this.xPath.compile("./comune");
		XPathExpression infoElement = this.xPath.compile("./infoaggiuntive");
		File folder = new File(ImportPoi.path);
		List<Poi> poiList = Lists.newArrayList();
		int countTot = 0;
		int countVal = 0;
		FilenameFilter fileFilter = new FilenameFilter() {
			@Override
	    public boolean accept(File directory, String fileName) {
        return fileName.endsWith(".xml");
			}
		};
		for (File fileEntry : folder.listFiles(fileFilter)) {
			if(!fileEntry.isDirectory()) {
				Document xmlDoc = this.documentBuilder.parse(new InputSource(new FileReader(fileEntry)));
				String regione = null;
				Node rootNode = (Node) rootElement.evaluate(xmlDoc, XPathConstants.NODE);
				if(rootNode != null) {
					regione = rootNode.getAttributes().getNamedItem("regione").getNodeValue();
					System.out.println("XMLToCSV: parsing " + regione);
					NodeList ufficiList = (NodeList) ufficioElement.evaluate(rootNode, XPathConstants.NODESET);
					if(ufficiList != null) {
						for(int i=0; i < ufficiList.getLength(); i++) {
							Node ufficioNode = ufficiList.item(i);
							ufficioNode.getParentNode().removeChild(ufficioNode);
							String name = (String) nameElement.evaluate(ufficioNode, XPathConstants.STRING);
							String address = (String) addressElement.evaluate(ufficioNode, XPathConstants.STRING);
							String comune = (String) comuneElement.evaluate(ufficioNode, XPathConstants.STRING);
							String cap = (String) capElement.evaluate(ufficioNode, XPathConstants.STRING);
							String description = (String) infoElement.evaluate(ufficioNode, XPathConstants.STRING);
							String type = getPoiType(name);
							countTot++;
							if(Utils.isNotEmpty(type)) {
								countVal++;
							}
							Poi ufficio = new Poi();
							ufficio.setApplicationId(ImportPoi.applicatinID);
							ufficio.setRegion(regione);
							ufficio.setName(name);
							ufficio.setAddress(address);
							ufficio.setDescription(description);
							ufficio.setType(type);
							poiList.add(ufficio);
						}
					}
				}
			}
		}
		System.out.println(String.format("XMLToCSV: poi %d di %d", countVal, countTot));
		FileWriter fileWriter = new FileWriter(ImportPoi.path + File.separator + "poi.csv");
		CSVFormat csvFileFormat = CSVFormat.DEFAULT
				.withDelimiter(';')
				.withEscape('\\')
				.withQuoteMode(QuoteMode.NONE);
		CSVPrinter csvFilePrinter = new CSVPrinter(fileWriter, csvFileFormat);
		csvFilePrinter.printRecord(Arrays.asList(ImportPoi.FILE_HEADER));
		for(Poi poi : poiList) {
			List<String> poiDataRecord = Lists.newArrayList();
			poiDataRecord.add(poi.getType());
			poiDataRecord.add(poi.getName());
			poiDataRecord.add(poi.getRegion());
			poiDataRecord.add(poi.getAddress());
			poiDataRecord.add(poi.getDescription());
			csvFilePrinter.printRecord(poiDataRecord);
		}
		fileWriter.flush();
		fileWriter.close();
		csvFilePrinter.close();
		System.out.println("XMLToCSV: csv created");
	}
	
	@Test
	public void CSVToPoi() throws Exception {
		List<Poi> poiList = Lists.newArrayList();
		FileReader fileReader = new FileReader(ImportPoi.path + File.separator + "elenco_poi_v03.csv");
		CSVFormat csvFileFormat = CSVFormat.DEFAULT
				.withDelimiter(';')
				.withEscape('\\')
				.withHeader(ImportPoi.FILE_HEADER);
		CSVParser csvFileParser = new CSVParser(fileReader, csvFileFormat);
		List<CSVRecord> csvRecords = csvFileParser.getRecords();
		int count = 0;
		for(int i = 1; i < csvRecords.size(); i++) {
			CSVRecord csvRecord = csvRecords.get(i);
			String type = csvRecord.get(0);
			if(Utils.isNotEmpty(type)) {
				count++;
				Poi ufficio = new Poi();
				ufficio.setApplicationId(ImportPoi.applicatinID);
				ufficio.setRegion(csvRecord.get(2));
				ufficio.setName(csvRecord.get(1));
				ufficio.setAddress(csvRecord.get(3));
				ufficio.setDescription(csvRecord.get(4));
				ufficio.setType(csvRecord.get(0));
				poiList.add(ufficio);
			}
		}
		fileReader.close();
		csvFileParser.close();
		System.out.println(String.format("CSVToPoi: poi %d", count));
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.configure(SerializationFeature.INDENT_OUTPUT, true);
		StringWriter writer = new StringWriter();
		objectMapper.writeValue(writer, poiList);
		String jsonBody = writer.toString();
		//System.out.println(String.format("CSVToPoi: json - %s", jsonBody));
		HttpClient httpClient = new HttpClient();
		PostMethod postMethod = new PostMethod(ImportPoi.importUrl + ImportPoi.applicatinID);
		StringRequestEntity requestEntity = new StringRequestEntity(jsonBody, "application/json", "UTF-8");
		postMethod.setRequestEntity(requestEntity);
		postMethod.addRequestHeader("Accept", "application/json");
		postMethod.addRequestHeader("X-ACCESS-TOKEN", accessToken);
		int statusCode = httpClient.executeMethod(postMethod);
		System.out.println(String.format("CSVToPoi: http response %d", statusCode));
	}

	private String getPoiType(String name) {
//		for(String type : Const.poiTypeArray) {
//			if(type.equals("TAR")) {
//				continue;
//			}
//			if(name.toLowerCase().contains(type.toLowerCase())) {
//				return type;
//			}
//		}
		return null;
	}
}
