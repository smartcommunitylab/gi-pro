/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
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
 ******************************************************************************/
package it.smartcommunitylab.gipro.model;

import java.util.List;

/**
 * @author raman
 *
 */
public class Service {

	private String id, name;
	private int cost;
	private List<ServiceSubtype> subtypes;
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getCost() {
		return cost;
	}
	public void setCost(int cost) {
		this.cost = cost;
	}
	public List<ServiceSubtype> getSubtypes() {
		return subtypes;
	}
	public void setSubtypes(List<ServiceSubtype> subtypes) {
		this.subtypes = subtypes;
	}
	
	public ServiceSubtype subtype(String subtype) {
		if (subtypes != null)
			for (ServiceSubtype sub : subtypes)
				if (sub.getSubtype().equals(subtype)) return sub;
		return null;
	}
	
	public static class ServiceSubtype {
		private String subtype, name;
		private int cost;
		public String getSubtype() {
			return subtype;
		}
		public void setSubtype(String subtype) {
			this.subtype = subtype;
		}
		public String getName() {
			return name;
		}
		public void setName(String name) {
			this.name = name;
		}
		public int getCost() {
			return cost;
		}
		public void setCost(int cost) {
			this.cost = cost;
		}
		
	}
}
