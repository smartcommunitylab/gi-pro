/**
 *    Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

package it.smartcommunitylab.gipro.controller;

import it.smartcommunitylab.gipro.common.UnauthorizedException;
import it.smartcommunitylab.gipro.common.Utils;
import it.smartcommunitylab.gipro.converter.Converter;
import it.smartcommunitylab.gipro.model.Poi;
import it.smartcommunitylab.gipro.model.Professional;
import it.smartcommunitylab.gipro.security.DataSetInfo;
import it.smartcommunitylab.gipro.storage.DataSetSetup;
import it.smartcommunitylab.gipro.storage.RepositoryManager;

import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.JsonNode;


@Controller
public class AdminController {
	private static final transient Logger logger = LoggerFactory.getLogger(AdminController.class);
			
	@Autowired
	private RepositoryManager storage;

	@Autowired
	private DataSetSetup dataSetSetup;
	
	@RequestMapping(method = RequestMethod.GET, value = "/ping")
	public @ResponseBody
	String ping(HttpServletRequest request, HttpServletResponse response, HttpSession session) {
		return "PONG";
	}
	
	@RequestMapping(value = "/dataset/{applicationId}", method = RequestMethod.POST)
	public @ResponseBody String updateDataSetInfo(@RequestBody DataSetInfo dataSetInfo, 
			@PathVariable String applicationId, HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		storage.saveAppToken(dataSetInfo.getApplicationId(), dataSetInfo.getToken());
		storage.saveDataSetInfo(dataSetInfo);
		dataSetSetup.init();
		if(logger.isInfoEnabled()) {
			logger.info("add dataSet");
		}
		return "{\"status\":\"OK\"}";
	}
	
	@RequestMapping(value = "/reload/{applicationId}", method = RequestMethod.GET)
	public @ResponseBody String reload(@PathVariable String applicationId, 
			HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		dataSetSetup.init();
		if(logger.isInfoEnabled()) {
			logger.info("reload dataSet");
		}
		return "{\"status\":\"OK\"}";
	}
	
	@RequestMapping(value = "/import/poi/{applicationId}/{datasetId}", method = RequestMethod.POST)
	public @ResponseBody String importPoi(@PathVariable String applicationId, @PathVariable String datasetId,
			@RequestBody List<Poi> poiList, HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		if(logger.isInfoEnabled()) {
			logger.info(String.format("importPoi[%s]", datasetId));
		}
		storage.cleanPoi(datasetId);
		for(Poi poi : poiList) {
			poi.setApplicationId(datasetId);
			storage.addPoi(poi);
		}
		return "{\"status\":\"OK\"}";
	}
	
	@RequestMapping(value = "/import/professional/{applicationId}/{datasetId}", method = RequestMethod.POST)
	public @ResponseBody String importProfessional(@PathVariable String applicationId, @PathVariable String datasetId,
			@RequestBody List<Professional> professionalList, HttpServletRequest request, HttpServletResponse response) throws Exception {
//		if(!Utils.validateAPIRequest(request, dataSetSetup, storage)) {
//			throw new UnauthorizedException("Unauthorized Exception: token not valid");
//		}
		if(logger.isInfoEnabled()) {
			logger.info(String.format("importProfessional[%s]", datasetId));
		}
		storage.cleanProfessional(datasetId);
		for(Professional professional : professionalList) {
			professional.setApplicationId(datasetId);
			storage.addProfessional(professional);
		}
		return "{\"status\":\"OK\"}";
	}
	
	@ExceptionHandler(Exception.class)
	@ResponseStatus(value=HttpStatus.INTERNAL_SERVER_ERROR)
	@ResponseBody
	public Map<String,String> handleError(HttpServletRequest request, Exception exception) {
		return Utils.handleError(exception);
	}
	
}
